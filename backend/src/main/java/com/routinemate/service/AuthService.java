package com.routinemate.service;

import com.routinemate.dto.AuthRequest;
import com.routinemate.dto.AuthResponse;
import com.routinemate.dto.RegisterRequest;
import com.routinemate.entity.NotificationPreference;
import com.routinemate.entity.Student;
import com.routinemate.exception.BadRequestException;
import com.routinemate.exception.ResourceNotFoundException;
import com.routinemate.repository.NotificationPreferenceRepository;
import com.routinemate.repository.StudentRepository;
import com.routinemate.security.JwtTokenProvider;
import com.routinemate.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final StudentRepository studentRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            StudentRepository studentRepository,
            NotificationPreferenceRepository preferenceRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider) {
        this.studentRepository = studentRepository;
        this.preferenceRepository = preferenceRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (studentRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered. Please log in.");
        }

        Student student = new Student(
                request.getName().trim(),
                email,
                passwordEncoder.encode(request.getPassword())
        );
        Student savedStudent = studentRepository.save(student);

        // Create default notification preference
        NotificationPreference pref = new NotificationPreference(savedStudent);
        preferenceRepository.save(pref);

        String token = tokenProvider.generateTokenFromUsername(savedStudent.getEmail(), savedStudent.getId());
        return new AuthResponse(token, savedStudent.getId(), savedStudent.getName(), savedStudent.getEmail());
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(authentication);

        return new AuthResponse(token, userPrincipal.getId(), userPrincipal.getName(), userPrincipal.getUsername());
    }

    @Transactional(readOnly = true)
    public Student getCurrentStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new BadRequestException("No authenticated user found in session");
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return studentRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }
}
