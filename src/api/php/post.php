<?php

$body = json_decode(file_get_contents('php://input'), true);

$content = $body["content"];
if (!isset($content)) {
    done("content field is required", 400);
    return;
}
$content = mb_trim($content);
if (mb_strlen($content) === 0) {
    done("content is empty or havs only spaces", 400);
    return;
}


$due_date = $body["dueDate"];
if (!isset($due_date)) {
    done("dueDate field is required", 400);
    return;
}
$due_date = parse_date($due_date);
if ($due_date === false) {
    done("invalid date format", 400);
    return;
}

query(
    'insert into tasks(content, due_date, done) values ($1, $2, false)',
    array($content, format_pg_date($due_date)),
);

done(array("ok" => true));

?>
