package com.routinemate.security;

import com.routinemate.entity.Student;
import com.routinemate.repository.StudentRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;

    public CustomUserDetailsService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Student not found with email: " + email));
        return UserPrincipal.create(student);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Student not found with id: " + id));
        return UserPrincipal.create(student);
    }
}
