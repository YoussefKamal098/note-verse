import {deepFreeze} from "shared-utils/obj.utils";
import {roles} from "../../../constants/roles";

const permissionOptions = [
    {value: roles.VIEWER, label: 'Viewer - Can view'},
    {value: roles.EDITOR, label: 'Editor - Can edit'}
];

export default deepFreeze(permissionOptions);

