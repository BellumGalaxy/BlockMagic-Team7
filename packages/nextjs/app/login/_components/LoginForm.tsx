import { useState } from "react";
import Link from "next/link";

interface UserLoginForm {
  username: string;
  password: string;
}

const LoginForm = () => {
  const [userForm, setUserForm] = useState<UserLoginForm>({ username: "", password: "" });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name, value);
    setUserForm(prevUserFormData => ({
      ...prevUserFormData, // Copy the previous state
      [name]: value, // Update the specific property that has changed
    }));
  };

  const handleLoginButton = () => {
    console.log(userForm);
  };

  return (
    <>
      <div className="flex justify-center">
        <div className="flex flex-col flex-initial justify-center">
          <input className="my-2" name="username" type="text" onChange={handleChange} />
          <input className="my-2" name="password" type="password" onChange={handleChange} />
          <button className="" onClick={handleLoginButton}>
            Login
          </button>
          <p className="text-center">
            Don't have an account? <br />
            <Link href="/signUp">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
