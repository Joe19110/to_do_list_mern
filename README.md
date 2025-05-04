# API Documentation Testing Results

Name: Joelliane Anggra
Binusian ID: 2802466322
Class: B4CC

access the full api docs here: http://localhost:5000/todolist/api-docs

## Todo

*/get_all*
---
![/get_all request](api-docs-screenshots/todo/get_all-req.png)
![/get_all response](api-docs-screenshots/todo/get_all-resp.png)
Get all todo list from database (auth required)


*/add_todo*
---
![/add_todo request](api-docs-screenshots/todo/add_todo-req.png)
![/add_todo response](api-docs-screenshots/todo/add_todo-resp.png)
Add a new todo list (auth required)


*/update_todo/{id}*
---
![/update_todo request](api-docs-screenshots/todo/update_todo-req.png)
![/update_todo response](api-docs-screenshots/todo/update_todo-resp.png)
Update todo list (auth required)


*/delete_todo/{id}*
---
![/delete_todo request](api-docs-screenshots/todo/delete_todo-req.png)
![/delete_todo response](api-docs-screenshots/todo/delete_todo-resp.png)
Delete a todo (no auth)


*when there is no authentication*
![no auth](api-docs-screenshots/todo/noauth.png)

## User


*/user-infor*
---
![/user_infor request](api-docs-screenshots/user/user_infor-req.png)
![/user_infor response](api-docs-screenshots/user/user_infor-resp.png)
Get user information (need auth)


*/signup*
---
![/signup request](api-docs-screenshots/user/signup-req.png)
![/signup response](api-docs-screenshots/user/signup-resp.png)
Sign up a new user


*/activate/{activation_token}*
---
![/activate_token request](api-docs-screenshots/user/activate_token-req.png)
![/activate_token response](api-docs-screenshots/user/activate_token-resp.png)
Activates user account using a token


*/activation*
---
![/activation request](api-docs-screenshots/user/activation-req.png)
![/activation response](api-docs-screenshots/user/activation-resp.png)
Activate user email


*/signin*
---
![/signin request](api-docs-screenshots/user/signin-req.png)
![/signin response](api-docs-screenshots/user/signin-resp.png)
Sign in user


*/select-role*
---
![/select_role request](api-docs-screenshots/user/select_role-req.png)
![/select_role response](api-docs-screenshots/user/select_role-resp.png)
Select user role after login (if user has more than 1 roles)


*/refresh_token*
---
![/refresh_token request](api-docs-screenshots/user/refresh_token-req.png)
![/refresh_token response](api-docs-screenshots/user/refresh_token-resp.png)
Refresh access token


*/forgot*
---
![/forgot request](api-docs-screenshots/user/forgot-req.png)
![/forgot response](api-docs-screenshots/user/forgot-resp.png)
Request password reset


*/reset*
---
![/reset request](api-docs-screenshots/user/reset-req.png)
![/reset response](api-docs-screenshots/user/reset-resp.png)
Reset user password (need auth)


*/users/{id}*
---
![/userinfo_byid request](api-docs-screenshots/user/userinfo_byid-req.png)
![/userinfo_byid response](api-docs-screenshots/user/userinfo_byid-resp.png)
Get user information by user ID (need auth)


*/get_staffs*
---
![/get_staffs request](api-docs-screenshots/user/get_staffs-req.png)
![/get_staffs response](api-docs-screenshots/user/get_staffs-resp.png)
Get all users staff (need auth)


*/all_infor*
---
![/all_infor request](api-docs-screenshots/user/all_infor-req.png)
![/all_infor response](api-docs-screenshots/user/all_infor-resp.png)
Get all users information (need auth)


*/logout*
---
![/logout request](api-docs-screenshots/user/logout-req.png)
![/logout response](api-docs-screenshots/user/logout-resp.png)
Logout user


*/update_user*
---
![/update_user request](api-docs-screenshots/user/update_user-req.png)
![/update_user response](api-docs-screenshots/user/update_user-resp.png)
Update user information (need auth)


*/update_role/{id}*
---
![/update_role request](api-docs-screenshots/user/update_role-req.png)
![/update_role response](api-docs-screenshots/user/update_role-resp.png)
Update user role (need auth)


*/update_user_status/{id}*
---
![/update_user_status request](api-docs-screenshots/user/update_user_status-req.png)
![/update_user_status response](api-docs-screenshots/user/update_user_status-resp.png)
Change the status of a user (eg., active, inactive)


*when there is no authentication*
![no auth](api-docs-screenshots/user/noauth.png)


*when admin/staff authentication is reinforced*
![no auth](api-docs-screenshots/user/adminorstaffauth.png)


*when admin authentication is reinforced*
![no auth](api-docs-screenshots/user/adminauth.png)


---

Updated DockerHub Link: https://hub.docker.com/repository/docker/joelliane/to-do-list-mern-updated


---


# Postman API Testing Results


*createTodo*
---
![create](postman-screenshots/create.png)


*getAllTodos*
---
![getAll](postman-screenshots/getAll.png)


*updateTodo*
---
![update](postman-screenshots/update.png)


*deleteTodo*
---
![delete](postman-screenshots/delete.png)


---


DockerHub Link: https://hub.docker.com/repository/docker/joelliane/to_do_list_mern
