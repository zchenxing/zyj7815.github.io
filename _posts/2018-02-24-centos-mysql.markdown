---
layout: post
title: 在centos上安装mysql 5.7
date: 2018-02-23 14:00:00 +0800
description: 在centos上安装mysql 5.7. 
img: 
tags: [Linux, MySql] 
---


Linux版本：`CentOS6.8`

之前在Linux上安装MySQL，安装流程一直都比较乱，因为对安装不熟，所以都是在百度Google上东搜搜西搜搜。也没有做详细的笔记，所以最近把MySQL删了又重新装了一遍，并把流程和遇到的问题详细的记录下来。

---

首先检查系统是否自带安装mysql，centos 6.8自带MySQL，不过版本比较低，应该是mysql5.1的版本
```
# yum list installed | grep mysql
```


删除系统自带的mysql及其依赖
```
# yum -y remove mysql-libsi686
```

安装yum源
```
wget http://dev.mysql.com/get/mysql57-community-release-el6-9.noarch.rpm
```


安装 mysql 源
```
yum localinstall mysql57-community-release-el6-9.noarch.rpm
```


检查 YUM 源是否安装成功
```
yum repolist enabled | grep "mysql.*-community.*"
```


因为本例下载的 5.7 版本的 repo，可以不用此步骤，如果想安装 MySQL 5.6，可以这样做
```
sudo yum-config-manager --disable mysql57-community
sudo yum-config-manager --enable mysql56-community
```

安装MySQL
```
yum install mysql-community-server
```


启动MySQL
```
service mysqld start
```


开机启动
```
chkconfig mysqld on
```


安装MySQL5.7，会有一个默认的初始密码，查看默认密码
```
grep 'temporary password' /var/log/mysqld.log
```


登录到MySQL，现在必须修改初始密码，不然会提示错误
```
ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.
```


那现在就设置新密码，刚安装完的mysql必须设置新密码（应该是从5.5版本开始）
```
mysql>  ALTER USER USER() IDENTIFIED BY '123123';
ERROR 1819 (HY000): Your password does not satisfy the current policy requirements
```



这时MySQL修改密码报错，这是因为MySQL对密码有安全级别的限制，所以想要设置简单的密码，先要修改MySQL的安全级别。MySQL具体的安全级别设置这里先不说了，主要是讲安装流程。
```
mysql> set global validate_password_policy=0;
```


默认密码长度为8，可以设置为其它值，最小4位
```
mysql> set global validate_password_length=4;
```


然后就可以设置一个简单的密码了
```
mysql> ser PASSWORD = PASSWORD('123123');
```


MySQL 默认只允许 root 帐户在本地登录，如果要在其它机器上连接 MySQL，必须修改 root 允许远程连接，或者添加一个允许远程连接的帐户，为了安全起见，添加一个新用户。
```
mysql> CREATE USER demo IDENTIFIED BY '123123';
```

允许可访问的表
```
mysql> GRANT ALL PRIVILEGES ON *.* TO 'demo'@'%'WITH GRANT OPTION;
```

==\*.\*== 表示可访问所有表，如果只允许该用户访问某个表，就将
```
mysql> GRANT ALL PRIVILEGES ON database_name.* TO 'demo'@'%'WITH GRANT OPTION 

```


MySQL 默认编码为 latin1, 一般修改为 UTF-8
```
 vi /etc/my.cnf
[mysqld]
# 在myslqd下添加如下键值对
character_set_server=utf8
init_connect='SET NAMES utf8'
```


修改生效
```
mysql> FLUSH PRIVILEGES;
```


退出MySQL服务器，这样就可以在其它任何的主机上以demo身份登录 
```
mysql> EXIT;
```
