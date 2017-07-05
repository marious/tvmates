<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
        body {
            background-color: darkcyan;
        }
        .user-info {
            border: 1px solid #DBDBDB;;
            /*min-width: 282px;*/
            /*max-width: 460px;*/
            width: 282px;
            min-height: 60px;
            background: #fff;
            /*position: absolute;*/
            top: 0;
            left: 0;
        }
        ul {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        li {
            display: list-item;
            text-align: -webkit-match-parent;
            line-height: 20.02px;
        }

        li a {
            display: block;
            padding: 0 32px;
            text-decoration: none;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }

        li a div.content {
            padding: 16px 0;
            color: #767676;
            border-bottom: 1px solid transparent;
            border-color: #f2f2f2;
            transition: border-color ease 0.1s;
        }

        li a div.content:hover {
            border-color: #484848;
        }

    </style>
</head>
<body>
    <div class="user-info">
        <ul>
            <li><a href=""><div class="content">Edit Profile</div></a></li>
            <li><a href=""><div class="content">Travel Credit</div></a></li>
            <li><a href=""><div class="content">My Guidebook</div></a></li>
            <li><a href=""><div class="content">Business Travel</div></a></li>
            <li><a href=""><div class="content">Log Out</div></a></li>
        </ul>
    </div>
</body>
</html>