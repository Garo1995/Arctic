<?php
$to = "https://arcticom.ru/";

// ВАЖНО: поставь реальный домен
$mail_from = "npakhomov2022@gmail.com";

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$user_subject = isset($_POST['subject']) ? trim($_POST['subject']) : 'Без темы';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

$errors = [];

// validation
if ($name === '' || !preg_match("/^[\p{L}\s'-]{2,60}$/u", $name)) {
    $errors[] = "Invalid name";
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email";
}

if ($message === '' || mb_strlen($message) < 5) {
    $errors[] = "Message too short";
}

if (!empty($errors)) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo implode("\n", $errors);
    exit;
}

// sanitize headers
$clean_email = str_replace(["\r", "\n"], '', $email);

// subject FIX
$subject = "Заявка: " . $user_subject;

// body
$body  = "Имя: $name\n";
$body .= "Email: $email\n";
$body .= "Тема: $user_subject\n\n";
$body .= "Сообщение:\n$message\n";

$body = wordwrap($body, 998);

// headers
$headers  = "From: $mail_from\r\n";
$headers .= "Reply-To: $clean_email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// send
$success = mail($to, $subject, $body, $headers);

header('Content-Type: text/plain; charset=utf-8');

if ($success) {
    echo "OK";
} else {
    http_response_code(500);
    echo "Send failed";
}
?>