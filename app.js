Inputmask({
    mask: "+7 (999) 999-99-99",
    showMaskOnHover: false
}).mask(document.querySelectorAll('input[type="tel"]'));

const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");

function showToast(text){

    toastText.textContent = text;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    },3000);

}

function initForm(formId, url, defaultButtonText) {

    const form = document.getElementById(formId);

    if (!form) return;

    const button = form.querySelector("button");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        button.disabled = true;
        button.textContent = "Отправляем...";

        const data = {
            name: form.name.value,
            phone: form.phone.value,
            comment: form.comment.value
        };

        try {

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            showToast(result.message);

            button.textContent = "✓ Отправлено";

            form.reset();

        } catch {

            showToast("Ошибка соединения");

            button.textContent = defaultButtonText;

        }

        setTimeout(() => {

            button.disabled = false;
            button.textContent = defaultButtonText;

        }, 2000);

    });

}

initForm(
    "consultationForm",
    "/consultation",
    "Закажите бесплатную консультацию"
);

initForm(
    "serviceForm",
    "/service",
    "Записаться в сервис"
);