import {deepFreeze} from "shared-utils/obj.utils";
import {permissionActions} from "../../../constants/roles";

const permissionActionOptions = [
    {value: permissionActions.REMOVE_ACCESS, label: 'Remove Access'}
];

export default deepFreeze(permissionActionOptions);
