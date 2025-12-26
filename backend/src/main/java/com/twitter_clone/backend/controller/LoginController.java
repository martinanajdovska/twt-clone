package com.twitter_clone.backend.controller;

import com.twitter_clone.backend.model.User;
import com.twitter_clone.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;


@Controller
@RequestMapping("/login")
public class LoginController {
    private final AuthService authService;
    public LoginController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public String getLoginPage() {
        return "login";
    }
    @PostMapping
    public String login(HttpServletRequest request, Model model) {
        User user = null;

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        try {
            user = authService.login(username, password);
            request.getSession().setAttribute("user", user);
            return "redirect:/";
        } catch (RuntimeException ex) {
            model.addAttribute("hasError", true);
            model.addAttribute("error", ex.getMessage());
            return "login";
        }
    }
}