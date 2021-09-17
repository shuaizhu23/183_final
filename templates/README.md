# Creating SQL tables by hand

You need to connect to your cloud database, and give these commands to
create the standard tables used by Auth.  You then need to create any
additional tables you use:

use sampledb;
show tables;
describe task;

drop table task;

CREATE TABLE `task`(
  `id` int(5) PRIMARY KEY AUTO_INCREMENT,
  `task_title` varchar(255),
  `task_done` varchar(1),
  `task_img` TEXT,
  `created_by` varchar(512),
  `task_difficulty` int(5),
  `task_xp` int(5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `adventurer`(
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `userid` varchar(255),
  `bpxp` INTEGER,
  `rolls` INTEGER,
  `full_name` varchar(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `rating`(
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `task_id` INTEGER REFERENCES `task` (`id`) ON DELETE CASCADE,
  `task_difficulty` INTEGER,
  `rater` varchar(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE rating (rater varchar(255));
CREATE TABLE adventurer (full_name varchar(255));

```
CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(512) DEFAULT NULL,
  `email` varchar(512) DEFAULT NULL,
  `password` varchar(512) DEFAULT NULL,
  `first_name` varchar(512) DEFAULT NULL,
  `last_name` varchar(512) DEFAULT NULL,
  `sso_id` varchar(512) DEFAULT NULL,
  `action_token` varchar(512) DEFAULT NULL,
  `last_password_change` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  `past_passwords_hash` text DEFAULT NULL,
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `auth_user_tag_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` varchar(512) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `record_id_fk` (`record_id`),
  CONSTRAINT `record_id_fk` FOREIGN KEY (`record_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `py4web_session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rkey` varchar(512) DEFAULT NULL,
  `rvalue` text,
  `expiration` int(11) DEFAULT NULL,
  `created_on` datetime DEFAULT NULL,
  `expires_on` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rkey__idx` (`rkey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
CREATE TABLE `task` (
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE 'task' ();


# Configuring your cloud project

```shell
gcloud config set app/promote_by_default false
gcloud config set core/account shuai168zhu@gmail.com
gcloud config set core/project platinum-factor-318523
```
