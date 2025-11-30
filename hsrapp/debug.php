<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header('Content-Type: application/json');

echo json_encode(array(
    "status" => "PHP is working",
    "method" => $_SERVER['REQUEST_METHOD'],
    "raw_input" => file_get_contents("php://input"),
    "post_data" => $_POST,
    "headers" => getallheaders()
));
?>