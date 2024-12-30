import Navbar from "../components/navbar/Navbar";
import RegisterForm from "../components/forms/RegisterForm";

const RegisterPage = () => {
    return (
        <div className="page">
            <Navbar showSearch={false}/>
            <div className="wrapper">
                <RegisterForm/>
            </div>
        </div>
    );
}

export default RegisterPage;