<?php

$search_number = $_GET["searchNumber"];

$search_due_date = $_GET["searchDueDate"];
$search_due_date_mode = $_GET["searchDueDateMode"];

$search_content = $_GET["searchContent"];
$search_content_mode = $_GET["searchContentMode"];

$done_mode = $_GET["done"];

$wheres = array();
$params = array();

if (isset($search_number)) {
    array_push($params, $search_number);
    array_push($wheres, sprintf('id = $%d', count($params)));
}

if (isset($search_due_date)) {
    $parsed = parse_date($search_due_date);
    if ($parsed === false) {
        done("invalid date format", 400);
        return;
    }

    $mode = $search_due_date_mode ?? "exact";

    $comp = "";
    switch ($mode) {
        case "exact":
            $comp = "=";
            break;
        case "older":
            $comp = "<";
            break;
        case "later":
            $comp = ">";
            break;
        default:
            done("unknown searchDueDateMode", 400);
            return;
    }

    array_push($params, format_pg_date($parsed));
    array_push($wheres, sprintf('due_date %s $%d', $comp, count($params)));
}

if (isset($search_content)) {
    $mode = $search_content_mode ?? "contain";

    array_push($params, $search_content);

    switch ($mode) {
        case "exact":
            array_push($wheres, sprintf('content = $%d', count($params)));
            break;
        case "contain":
            array_push($wheres, sprintf('content like \'%%\' || $%d || \'%%\'', count($params)));
            break;
        default:
            done("unknown searchContentMode", 400);
            return;
    }
}

if (isset($done_mode)) {
    switch ($done_mode) {
        case 'notDone':
            array_push($wheres, 'done = false');
            break;
        case 'done':
            array_push($wheres, 'done = true');
            break;
        case 'both':
            break;
        default:
            done('unknown done parameter', 400);
            return;
    }
}

$sql = 'select * from tasks';
if (count($wheres) > 0) {
    $sql .= ' where ';
    $sql .= implode($wheres, ' and ');
}

$sql .= ' order by due_date asc, id';

$res = query($sql, $params);
$res = $res === false ? array() : $res;

$res = array_map(function($o) {
    return array(
        "id" => intval($o["id"]),
        "content" => $o["content"],
        "dueDate" => $o["due_date"],
        "done" => $o["done"] === "t",
    );
}, $res);

done(array('tasks' => $res));

?>
