<?php

include('../php/_init.php');

switch($method) {
    case 'GET':
        include('../php/get.php');
        break;
    case 'POST':
        include("../php/post.php");
        break;
    case 'PUT':
        include("../php/put.php");
        break;
    case 'DELETE':
        include("../php/delete.php");
        break;
    default:
        done('Method Not Allowed', 405);
        break;
}

?>
