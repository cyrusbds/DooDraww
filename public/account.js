// Sign In / Sign Up Tab Switching
const signInTab = document.getElementById("signin-tab");
const signUpTab = document.getElementById("signup-tab");
const signInForm = document.getElementById("signin-form");
const signUpForm = document.getElementById("signup-form");

document.addEventListener('DOMContentLoaded', () => {
    // No auth check needed on login page
});

async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        if (!data.authenticated) {
            window.location.href = '/account';
        } else {
            currentUser = data;
            await loadUserProfile();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/account';
    }
}

signInTab.addEventListener("click", () => {
    signInTab.classList.add("active");
    signUpTab.classList.remove("active");
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
})

signUpTab.addEventListener("click", () => {
    signUpTab.classList.add("active");
    signInTab.classList.remove("active");
    signUpForm.style.display = "block";
    signInForm.style.display = "none";
})

// Sign In Functionality
signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    if (email && password) {
        try {
            const response = await fetch("/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Welcome back, ${data.user.name}!`);
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("userName", data.user.name);

                window.location.href = "/";
            } else {
                alert(data.error || "Invalid email or password.")
            }
        } catch (err) {
            alert("An error occurred. Please try again later.")
        }
    } else {
        alert("All fields are required!")
    }
});

// Sign Up Functionality
signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (name && email && password) {
        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Sign Up Successful! You can now sign in.");
                signUpForm.reset();
                signInTab.classList.add("active");
                signUpTab.classList.remove("active");
                signInForm.style.display = "block";
                signUpForm.style.display = "none";
                document.getElementById('signin-email').value = email;
            } else {
                alert(data.error || "Sign Up Failed!")
            }
        } catch (err) {
            alert("An error occurred. Please try again later.")
        }
    } else {
        alert("All fields are required!")
    }
});
