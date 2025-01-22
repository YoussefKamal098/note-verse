import 'react-toastify/dist/ReactToastify.css';
import {ToastNotificationContainerStyled} from './ToastNotificationsStyled';

const ToastNotifications = () => (
    <ToastNotificationContainerStyled
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
    />
);

export default ToastNotifications;
