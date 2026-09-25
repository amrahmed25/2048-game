const SUPABASE_URL = "https://rlzswdiltesxldwdzdlf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fYbGrtavOW-foTMPxCKBbA_WxSCTrhE";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const messageDivCSS = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate(15%, -10px);
        }
        to {
            opacity: 1;
            transform: translate(15%, 0);
        }
    }

    #messageDiv {
        position: fixed;

        top: 24px;
        left: 32%;

        width: min(90vw, 420px);
        min-height: 0;

        display: none;
        align-items: center;
        justify-content: center;

        padding: 14px 20px;

        background: rgba(10, 15, 30, 0.55);

        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);

        border: 1px solid rgba(255, 255, 255, 0.14);

        border-radius: 14px;

        box-shadow:
            0 15px 40px rgba(0, 0, 0, 0.45),
            0 0 25px rgba(255, 0, 70, 0.12),
            0 0 25px rgba(0, 140, 255, 0.10);

        z-index: 9999;

        box-sizing: border-box;

        animation: fadeIn 0.4s ease forwards;
    }

    /* =========================
       MOBILE
       ========================= */

@media (max-width: 768px) {
    #messageDiv {
        width: 95vw;
        max-width: 95vw;

        margin-left: -47.5vw;

        top: 16px;

        padding: 13px 18px;
    }

    #message {
        font-size: 14px;
        line-height: 1.5;

        word-break: normal;
        overflow-wrap: break-word;
    }
}

@media (max-width: 400px) {
    #messageDiv {
        width: 94vw;
        max-width: 94vw;

        margin-left: -47vw;

        padding: 12px 15px;
    }

    #message {
        font-size: 13px;
    }
}

    #messageDiv::before {
        content: "";

        position: absolute;

        top: 0;
        left: 15%;
        right: 15%;

        height: 2px;

        border-radius: 999px;

        background: linear-gradient(
            90deg,
           #7f00ff,
            #a100ff,
            #d100ff,
            #ff1493
        );

        box-shadow:
            0 0 12px rgba(255, 0, 60, 0.6),
            0 0 15px rgba(0, 140, 255, 0.4);
    }

    #message {
        margin: 0;

        color: rgba(255, 255, 255, 0.9);

        font-size: 14px;
        font-weight: 500;

        line-height: 1.5;

        text-align: center;

        word-break: break-word;
    }
`;

const stylemessageDiv = document.createElement("style");
stylemessageDiv.textContent = messageDivCSS;
document.head.appendChild(stylemessageDiv);

async function whenSubmit(e) {
    e.preventDefault();

    const nameInput =
        document.getElementById("name")?.value.trim() || "";

    const emailInput =
        document.getElementById("email")?.value.trim() || "";

    const passwordInput =
        document.getElementById("password")?.value || "";

    const greetingMessage =
        document.getElementById("greeting");

    const messageDiv =
        document.getElementById("messageDiv");

    const messagePlace =
        document.getElementById("message");

    function showMessage(message) {
        if (messageDiv) {
            messageDiv.style.display = "flex";
        }

        if (messagePlace) {
            messagePlace.textContent = message;
        }
    }

    const isRegister =
    greetingMessage?.innerText.trim().toLowerCase() === "sign up for 2048 game";

    console.log("AUTH MODE:", isRegister ? "SIGN UP" : "LOGIN");
console.log("GREETING TEXT:", greetingMessage?.innerText);

    if (isRegister) {

        if (!nameInput) {
            showMessage("Please enter your name.");
            return;
        }

        if (!emailInput) {
            showMessage("Please enter your email.");
            return;
        }

        if (!passwordInput) {
            showMessage("Please enter your password.");
            return;
        }

        if (passwordInput.length < 6) {
            showMessage("Password must be at least 6 characters.");
            return;
        }

        showMessage("Creating your account...");

        try {

            const {
                data,
                error
            } = await supabaseClient.auth.signUp({
                email: emailInput,
                password: passwordInput,
                options: {
                    data: {
                        username: nameInput
                    }
                }
            });

            if (error) {
                console.error("Sign Up error:", error);
                showMessage(error.message);
                return;
            }

            if (!data || !data.user) {

                console.error(
                    "Supabase Sign Up returned no user:",
                    data
                );

                showMessage(
                    "Account creation failed. No user was created."
                );

                return;
            }


            console.log(
                "Supabase Auth user created:",
                data.user
            );

            try {

                await ensurePlayerProfile(
                    data.user,
                    nameInput
                );

                console.log(
                    "Player profile created successfully."
                );

            } catch (profileErr) {

                console.error(
                    "Player profile creation failed:",
                    profileErr
                );

            }

            showMessage(
                "Account created successfully!"
            );

            setTimeout(() => {
                window.location.href = "home.html";
            }, 1500);


            return;

        } catch (err) {

            console.error(
                "Unexpected Sign Up error:",
                err
            );

            showMessage(
                "Something went wrong while creating your account."
            );

            return;
        }
    }


    if (!emailInput) {
        showMessage("Please enter your email.");
        return;
    }

    if (!passwordInput) {
        showMessage("Please enter your password.");
        return;
    }

    showMessage("Logging in...");


    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: emailInput,
            password: passwordInput
        });

        if (error) {

            console.error(
                "Login error:",
                error
            );

            showMessage(error.message);

            return;
        }


        if (!data || !data.user) {

            console.error(
                "Login returned no user:",
                data
            );

            showMessage(
                "Login failed. User account was not found."
            );

            return;
        }


        console.log(
            "Logged in user:",
            data.user
        );


        try {

            await ensurePlayerProfile(
                data.user
            );

            console.log(
                "Player profile verified successfully."
            );

        } catch (profileErr) {

            console.error(
                "Error ensuring player profile on login:",
                profileErr
            );
        }


        showMessage(
            "Login successful! Redirecting..."
        );


        setTimeout(() => {
            window.location.href = "home.html";
        }, 1500);


    } catch (err) {

        console.error(
            "Unexpected Login error:",
            err
        );

        showMessage(
            "Something went wrong while logging in."
        );
    }
}