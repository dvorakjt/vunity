export function hideRecaptcha() {
    const recaptcha = document.getElementsByClassName('grecaptcha-badge')[0] as any;
    if(recaptcha) {
        recaptcha.style.visibility = 'hidden';
    }
}

export function showRecaptcha() {
    const recaptcha = document.getElementsByClassName('grecaptcha-badge')[0] as any;
    if(recaptcha) {
        recaptcha.style.visibility = 'visible';
    }
}