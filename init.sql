drop table if exists tasks;

create table if not exists tasks(
    id serial primary key,
    content text not null,
    due_date date not null,
    done bool not null
);

insert into tasks(content, due_date, done)
values
    ('電波課題', '2023-11-28', true),
    ('実験レポート', '2023-12-01', true),
    ('倫理課題', '2023-12-04', false);
