<?php

$body = json_decode(file_get_contents('php://input'), true);

$id = $body["id"];
if (!isset($id)) {
    done("id field is required", 400);
    return;
}

query('delete from tasks where id = $1', array($id));

done(array("ok" => true));
?>
