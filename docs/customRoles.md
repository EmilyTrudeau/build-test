---
id: custom_roles
title: Custom Roles
sidebar_label: Custom Roles
slug: /custom_roles
---

Custom roles can also be defined for more refined control over project access. To define a role, a label and list of allowed actions (for a full list of actions, see [Available Actions](#role-action-table)).
```python
    # Edit these values to match a real group id and a project label that belongs to that group
    group_id = 'group_id'
    project_label = 'project_label'

    # These actions (read_only actions) are required for any new role definition
    REQUIRED_ACTIONS = [
            'containers_view_metadata',
            'files_view_metadata',
            'tags_view',
            'notes_view',
            'project_permissions_view',
            'data_views_view',
            'session_templates_view',
            'gear_rules_view',
            'jobs_view'
    ]
    # Add files_modify_metadata to list
    action_list = REQUIRED_ACTIONS + ['files_modify_metadata']
    # Create a dictionary defining label and actions
    role_dict = {'label': 'role_a_d20', 'actions': action_list}

    # Add the role to Flywheel
    role_a_d20 = fw.add_role(role_dict)

    # Add the role to a group
    fw.add_role_to_group(group_id, {'_id': role_a_d20.id})

    # Get a project
    project = fw.lookup(f'{group_id}/{project_label}')

    # Add role for a user not yet on the project (but has been added to the Flywheel instance)
    # Replace new_user@example.com with an email address belonging to a real user
    user_id = 'new_user@example.com'
    project.add_permission({'_id': user_id, 'role_ids': [role_a_d20.id]})

    # Add role for user with existing permissions on the project
    # Add containers_modify_metadata to list
     action_list = REQUIRED_ACTIONS + ['containers_modify_metadata']
    
    # Create a dictionary defining label and actions
    role_dict = {'label': 'barrel_role', 'actions': action_list}
    
    # Add the role to flywheel
    barrel_role = fw.add_role(role_dict)
    
    # Add the role to a group
    fw.add_role_to_group(group_id, barrel_role.id)
    
    # Get the current permission dictionary for user
    permission_dict = fw.get_project_user_permission(project.id, user_id)
    
    # Add role id to the current list of role ids
    permission_dict['role_ids'].append(barrel_role.id)
    
    # Update the user's permissions with the modified permission_dict
    project.update_permission(user_id, permission_dict)

    # List all roles
    fw.get_all_roles()

    # List all group roles
    fw.get_all_group_roles(group_id)

    # We need to remove the permission that uses the role before removing the role from group
    project.delete_permission(user_id)

    # Delete the role from group
    fw.remove_role_from_group(group_id, barrel_role.id)

    # Delete the role
    fw.delete_role(barrel_role.id)
```
[Available Actions](#h_01ENTEZVH0NE4M7B0QX25H7GV3)
--------------------------------------------------

|Action|Description|
|:-----|:----------|
|containers\_view\_metadata|View Container Metadata|
|containers\_create\_hierarchy|Create Container Hierarchy|
|containers\_modify\_metadata|Modify Container Metadata|
|containers\_delete\_hierarchy|Delete Container Hierarchy|
|containers\_delete\_project|Delete Project (Project Permission)|
|analyses\_view\_metadata|View Analysis Metadata|
|analyses\_create\_sdk|Create Adhoc Analysis|
|analyses\_create\_job|Create Job-Based Analysis|
|analyses\_modify\_metadata|Modify Analysis Metadata|
|analyses\_delete|Delete Analysis|
|files\_view\_metadata|View File Metadata|
|files\_view\_contents|View File Contents|
|files\_download|Download File|
|files\_create\_upload|Create/Upload File|
|files\_modify\_metadata|Modify File Metadata|
|files\_delete\_non\_device\_data|Delete Non-Device File Data|
|files\_delete\_device\_data|Delete Device File Data|
|tags\_view|View Tags|
|tags\_manage|Manage Tags|
|notes\_view|View Notes|
|notes\_manage|Manage Notes|
|project\_permissions\_view|View Project Permissions|
|project\_permissions\_manage|Manage Project Permissions|
|gear\_rules\_view|View Project Gear Rules|
|gear\_rules\_manage|Manage Project Gear Rules|
|data\_views\_view|View Data Views|
|data\_views\_manage|Manage Data Views|
|session\_templates\_view|View Session Templates|
|session\_templates\_manage|Manage Session Templates|
|jobs\_view|View Jobs|
|jobs\_run\_cancel|Run and Cancel Jobs|
|jobs\_cancel\_any|Cancel Any Job|


