<?php
/**
 * お問い合わせフォーム送信処理
 */

// 設定
$to = "a.chinsuko@gmail.com"; // 受信先メールアドレス
$subject_prefix = "【ウェブサイトお問い合わせ】";

// セキュリティ: POSTメソッド以外を拒否
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit;
}

// 入力データの取得
$name = isset($_POST['name']) ? htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8') : '';
$email = isset($_POST['email']) ? htmlspecialchars($_POST['email'], ENT_QUOTES, 'UTF-8') : '';
$phone = isset($_POST['phone']) ? htmlspecialchars($_POST['phone'], ENT_QUOTES, 'UTF-8') : '';
$inquiry_type = isset($_POST['inquiry-type']) ? htmlspecialchars($_POST['inquiry-type'], ENT_QUOTES, 'UTF-8') : '';
$message = isset($_POST['message']) ? htmlspecialchars($_POST['message'], ENT_QUOTES, 'UTF-8') : '';

// 必須チェック
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "必須項目が入力されていません。"]);
    exit;
}

// メールの内容構成
$subject = $subject_prefix . $inquiry_type . " " . $name . "様より";

$body = "ウェブサイトからお問い合わせがありました。\n\n";
$body .= "--------------------------------------------------\n";
$body .= "【お名前】: $name\n";
$body .= "【メールアドレス】: $email\n";
$body .= "【電話番号】: " . ($phone ?: "未入力") . "\n";
$body .= "【お問い合わせ種別】: $inquiry_type\n";
$body .= "【お問い合わせ内容】:\n$message\n";
$body .= "--------------------------------------------------\n";
$body .= "送信日時: " . date("Y/m/d H:i:s") . "\n";
$body .= "送信元IP: " . $_SERVER['REMOTE_ADDR'] . "\n";

// メールヘッダー
// 送信元（From）はサーバーのドメインに合わせるのがベストですが、
// ひとまず「noreply@」などの固定アドレスにし、Reply-Toにお客様のアドレスを設定します。
$from = "noreply@chinsuko-arakaki.com";
$headers = "From: " . $from . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// メール送信
// 第5引数に -f を追加して、送信元メールアドレスのエンベロープ（エラー返信先）を明示的に指定します。
if (mail($to, $subject, $body, $headers, "-f " . $from)) {
    echo json_encode(["status" => "success", "message" => "お問い合わせを受け付けました。ありがとうございます。"]);
} else {
    // PHPのmail()関数自体が失敗した場合
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "サーバー側の設定により送信できませんでした。"]);
}
?>