<?php
// Включаем заголовки для JSON
header('Content-Type: application/json; charset=utf-8');

// Отключаем вывод фатальных системных ошибок в HTML
error_reporting(0);
ini_set('display_errors', 0);

// === НАСТРОЙКИ ===
$to          = "info@arcticom.ru"; // Email заказчика
$siteName    = "Arcticom";         // Название сайта
$domain      = "arcticom.ru";      // Домен
// =================

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Очищаем полученные данные
    $name    = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
    $phone   = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
    $email   = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
    $message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

    // Валидация полей
    if (empty($name) || empty($phone) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Не заполнено']);
        exit;
    }

    // Текст письма
    $body  = "Новая заявка с сайта $siteName (https://$domain)\n";
    $body .= "----------------------------------------\n";
    $body .= "Имя: $name\n";
    $body .= "Телефон: $phone\n";
    $body .= "Email: $email\n";
    $body .= "Описание задачи: " . (!empty($message) ? $message : 'Не указано') . "\n";

    // Заголовки письма
    $headers  = "From: no-reply@{$domain}\r\n";
    $headers .= "Reply-To: {$email}\r\n";
    $headers .= "Content-Type: text/plain; charset=utf-8\r\n";

    // Попытка отправки
    $mailSent = @mail($to, $subject, $body, $headers);

    if ($mailSent) {
        echo json_encode(['status' => 'success']);
    } else {
        // Если mail() не сработал на хостинге
        echo json_encode(['status' => 'error', 'message' => 'Mail function disabled']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid method']);
}