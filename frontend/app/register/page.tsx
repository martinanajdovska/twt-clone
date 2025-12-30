import React from 'react'
import RegisterForm from "@/components/RegisterForm";
import styles from "@/styles/layout.module.css";

const Register = () => {
    return (
        <div className={styles.container}>
            <div className={styles.layout}>
                <RegisterForm />
            </div>
        </div>
    )
}
export default Register
