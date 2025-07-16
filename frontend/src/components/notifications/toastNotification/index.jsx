import 'react-toastify/dist/ReactToastify.css';
import {ToastNotificationContainerStyled} from './styles';

const ToastNotifications = () => (
    <ToastNotificationContainerStyled
        position="top-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
    />
);

export default ToastNotifications;
