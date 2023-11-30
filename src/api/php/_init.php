<?php

$pgcon = pg_connect("host='postgres' dbname='www' user='apache' password='passworda'");
$method = $_SERVER["REQUEST_METHOD"];

function done($ret, $code = 200) {
    global $pgcon;
    pg_close($pgcon);

    header('Content-Type: application/json; charset=UTF-8');
    http_response_code($code);
    echo(json_encode($ret, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function query($sql, $params = []) {
    global $pgcon;

    $result = pg_query_params($pgcon, $sql, $params);
    if (!$result) {
        ob_start();
        var_dump(array(
            "sql" => $sql,
            "params" => $params
        ));
        $context = ob_get_clean();
        throw new Exception("failed to fetch: {$context}");
    }

    return pg_fetch_all($result);
}

function parse_date($input) {
    $parsed = date_parse_from_format('Y-m-d', $input);
    if (
        $parsed["year"] === false ||
        $parsed["month"] === false ||
        $parsed["day"] === false ||
        $parsed["warning_count"] != 0 ||
        $parsed["error_count"] != 0
    ) {
        return false;
    }

    return $parsed;
}

function mb_trim($s) {
    return preg_replace('/\A[\p{Cc}\p{Cf}\p{Z}]++|[\p{Cc}\p{Cf}\p{Z}]++\z/u', '', $s);
}

function format_pg_date($parsed_date) {
    return sprintf("%04d-%02d-%02d", $parsed_date["year"], $parsed_date["month"], $parsed_date["day"]);
}

?>
