import { Link } from "react-router-dom";

function Login() {
  return (
    <div>
      <h1>Login</h1>
      <Link to="/dashboard">Ir para Dashboard</Link>
    </div>
  );
}

export default Login;