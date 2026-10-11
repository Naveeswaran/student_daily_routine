package com.routinemate.service;

import com.routinemate.dto.NotificationPreferenceDto;
import com.routinemate.dto.PasswordChangeRequest;
import com.routinemate.dto.StudentProfileDto;
import com.routinemate.entity.NotificationPreference;
import com.routinemate.entity.Student;
import com.routinemate.exception.BadRequestException;
import com.routinemate.repository.NotificationPreferenceRepository;
import com.routinemate.repository.StudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class SettingsService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public SettingsService(
            NotificationPreferenceRepository preferenceRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {
        this.preferenceRepository = preferenceRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAllSettings(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new BadRequestException("Student not found"));

        NotificationPreference pref = preferenceRepository.findByStudentId(studentId)
                .orElseGet(() -> preferenceRepository.save(new NotificationPreference(student)));

        Map<String, Object> map = new HashMap<>();
        map.put("profile", new StudentProfileDto(student.getId(), student.getName(), student.getEmail()));
        map.put("notifications", toDto(pref));
        return map;
    }

    @Transactional
    public NotificationPreferenceDto updateNotificationPreferences(Long studentId, NotificationPreferenceDto dto) {
        NotificationPreference pref = preferenceRepository.findByStudentId(studentId)
                .orElseThrow(() -> new BadRequestException("Preferences not found for student"));

        if (dto.getEnabled() != null) pref.setEnabled(dto.getEnabled());
        if (dto.getReminderIntervalMinutes() != null) pref.setReminderIntervalMinutes(dto.getReminderIntervalMinutes());
        if (dto.getQuietStart() != null) pref.setQuietStart(dto.getQuietStart());
        if (dto.getQuietEnd() != null) pref.setQuietEnd(dto.getQuietEnd());
        if (dto.getSoundEnabled() != null) pref.setSoundEnabled(dto.getSoundEnabled());
        if (dto.getTheme() != null) pref.setTheme(dto.getTheme().toLowerCase().trim());
        if (dto.getWeekStartDay() != null) pref.setWeekStartDay(dto.getWeekStartDay().toUpperCase().trim());

        NotificationPreference saved = preferenceRepository.save(pref);
        return toDto(saved);
    }

    @Transactional
    public StudentProfileDto updateProfile(Long studentId, StudentProfileDto dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new BadRequestException("Student not found"));

        String newEmail = dto.getEmail().trim().toLowerCase();
        if (!newEmail.equalsIgnoreCase(student.getEmail()) && studentRepository.existsByEmail(newEmail)) {
            throw new BadRequestException("Email is already taken by another account");
        }

        student.setName(dto.getName().trim());
        student.setEmail(newEmail);
        Student saved = studentRepository.save(student);
        return new StudentProfileDto(saved.getId(), saved.getName(), saved.getEmail());
    }

    @Transactional
    public void changePassword(Long studentId, PasswordChangeRequest req) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new BadRequestException("Student not found"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), student.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        student.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        studentRepository.save(student);
    }

    private NotificationPreferenceDto toDto(NotificationPreference pref) {
        return new NotificationPreferenceDto(
                pref.getEnabled(),
                pref.getReminderIntervalMinutes(),
                pref.getQuietStart(),
                pref.getQuietEnd(),
                pref.getSoundEnabled(),
                pref.getTheme(),
                pref.getWeekStartDay()
        );
    }
}
