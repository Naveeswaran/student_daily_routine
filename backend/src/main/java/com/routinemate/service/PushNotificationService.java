package com.routinemate.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.routinemate.dto.PushSubscriptionRequest;
import com.routinemate.entity.PushSubscription;
import com.routinemate.entity.Student;
import com.routinemate.repository.PushSubscriptionRepository;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Utils;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Security;
import java.security.spec.ECGenParameterSpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PushNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);

    private final PushSubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.push.vapid.public-key:}")
    private String configuredPublicKey;

    @Value("${app.push.vapid.private-key:}")
    private String configuredPrivateKey;

    @Value("${app.push.vapid.subject:mailto:admin@routinemate.com}")
    private String vapidSubject;

    private String activeVapidPublicKey;
    private PushService pushService;

    public PushNotificationService(PushSubscriptionRepository subscriptionRepository, ObjectMapper objectMapper) {
        this.subscriptionRepository = subscriptionRepository;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }

        try {
            // First attempt to initialize with configured keys
            if (configuredPublicKey != null && !configuredPublicKey.isBlank() &&
                configuredPrivateKey != null && !configuredPrivateKey.isBlank()) {
                pushService = new PushService(configuredPublicKey, configuredPrivateKey, vapidSubject);
                this.activeVapidPublicKey = configuredPublicKey;
                logger.info("Web Push Service initialized with configured VAPID credentials.");
                return;
            }
        } catch (Exception e) {
            logger.warn("Configured VAPID keys were invalid ({}), generating fresh SECP256R1 VAPID keypair...", e.getMessage());
        }

        // Fallback: Generate a fresh valid standard NIST P-256 (secp256r1) keypair
        try {
            KeyPairGenerator kpg = KeyPairGenerator.getInstance("ECDH", BouncyCastleProvider.PROVIDER_NAME);
            kpg.initialize(new ECGenParameterSpec("secp256r1"));
            KeyPair keyPair = kpg.generateKeyPair();

            pushService = new PushService();
            pushService.setKeyPair(keyPair);
            pushService.setSubject(vapidSubject);

            byte[] pubBytes = Utils.encode((org.bouncycastle.jce.interfaces.ECPublicKey) keyPair.getPublic());
            this.activeVapidPublicKey = Base64.getUrlEncoder().withoutPadding().encodeToString(pubBytes);

            logger.info("Web Push Service generated and initialized successfully with runtime VAPID keys!");
        } catch (Exception ex) {
            logger.warn("Could not generate runtime EC keypair: {}. Web Push will run in local simulation mode.", ex.getMessage());
            this.activeVapidPublicKey = "BNZ-MOCK-VAPID-PUBLIC-KEY-ROUTINEMATE";
        }
    }

    public String getVapidPublicKey() {
        return activeVapidPublicKey != null ? activeVapidPublicKey : configuredPublicKey;
    }

    @Transactional
    public void subscribe(Student student, PushSubscriptionRequest request) {
        subscriptionRepository.findByStudentIdAndEndpoint(student.getId(), request.getEndpoint())
                .ifPresent(subscriptionRepository::delete);

        PushSubscription subscription = new PushSubscription(
                student,
                request.getEndpoint(),
                request.getP256dh(),
                request.getAuth()
        );
        subscriptionRepository.save(subscription);
        logger.info("Registered push subscription for student id: {}", student.getId());
    }

    @Transactional
    public void unsubscribe(Student student, String endpoint) {
        subscriptionRepository.findByStudentIdAndEndpoint(student.getId(), endpoint)
                .ifPresent(subscriptionRepository::delete);
        logger.info("Unsubscribed push endpoint for student id: {}", student.getId());
    }

    public boolean sendPushNotification(Student student, String title, String body, Map<String, Object> data) {
        List<PushSubscription> subscriptions = subscriptionRepository.findByStudentId(student.getId());
        if (subscriptions.isEmpty()) {
            logger.debug("No active push subscriptions found for student: {}", student.getEmail());
            return false;
        }

        Map<String, Object> payloadMap = new HashMap<>();
        payloadMap.put("title", title);
        payloadMap.put("body", body);
        payloadMap.put("icon", "/favicon.ico");
        payloadMap.put("badge", "/favicon.ico");
        payloadMap.put("data", data);

        boolean anySuccess = false;

        for (PushSubscription sub : subscriptions) {
            try {
                if (pushService != null) {
                    String payloadJson = objectMapper.writeValueAsString(payloadMap);
                    Notification notification = new Notification(
                            sub.getEndpoint(),
                            sub.getP256dh(),
                            sub.getAuth(),
                            payloadJson.getBytes("UTF-8")
                    );
                    var response = pushService.send(notification);
                    int statusCode = response.getStatusLine().getStatusCode();
                    if (statusCode == 201 || statusCode == 200) {
                        anySuccess = true;
                        logger.info("Push notification delivered to student {} (status: {})", student.getId(), statusCode);
                    } else if (statusCode == 404 || statusCode == 410) {
                        logger.warn("Push subscription expired (status: {}). Removing endpoint.", statusCode);
                        subscriptionRepository.delete(sub);
                    } else {
                        logger.warn("Push notification returned non-success status: {}", statusCode);
                    }
                }
            } catch (Exception ex) {
                logger.warn("Failed to deliver push notification: {}", ex.getMessage());
            }
        }

        return anySuccess;
    }
}
