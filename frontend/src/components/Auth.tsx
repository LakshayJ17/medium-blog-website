import { SignupInput } from "@lakshayj17/common-app"
import axios from "axios"
import { ChangeEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BACKEND_URL } from "../config"
import { Spinner } from "./Spinner"

export const Auth = ({ type }: { type: "signup" | "signin" }) => {

    // Type of inputs are specified using the npm package created using common folder
    const [postInputs, setPostInputs] = useState<SignupInput>({
        name: "",
        email: "",
        password: "",
    })

    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();

    async function sendRequest() {
        setLoading(true)
        try {
            // zod will ignore name field in case of signin
            const response = await axios.post(`${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`, postInputs);
            console.log(response.data)
            const jwt = response.data;
            localStorage.setItem("token", jwt);
            navigate("/blogs")

        } catch (error) {
            alert("Error while signing up")
            console.log(error)
        } finally {
            setLoading(false)
        }

    }

    return <>
        <div className="h-screen flex justify-center flex-col">
            <div className="flex justify-center">
                <div>
                    <div className="px-8">
                        <div className="text-center text-3xl sm:text-5xl font-bold">
                            {type === "signup" ? "Create an account" : "Welcome back  "}
                        </div>
                        <div className="text-slate-600 text-center">
                            {type === "signup" ? "Already have an account ?" : "Don't have an account ?"}
                            <Link className="pl-2 underline" to={type === "signin" ? "/signup" : "/signin"}>
                                {type === "signup" ? "Log In" : "Sign Up"}
                            </Link>
                        </div>
                    </div>

                    <div className="py-5 space-y-5">
                        {type === "signup" ? <LabeledInput label="Name" placeholder="Enter your name" onChange={(e) => {
                            setPostInputs({
                                ...postInputs,
                                name: e.target.value
                            });
                            localStorage.setItem("name", e.target.value);
                        }} /> : null}

                        <LabeledInput label="Email" placeholder="Enter your email" onChange={(e) => {
                            setPostInputs({
                                ...postInputs,
                                email: e.target.value
                            })
                        }} />
                        <LabeledInput label="Password" type={"password"} placeholder="Enter password" onChange={(e) => {
                            setPostInputs({
                                ...postInputs,
                                password: e.target.value
                            })
                        }} />
                        <button onClick={sendRequest} type="button" className="cursor-pointer mt-3 w-full text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-4 me-2 mb-2">
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <Spinner size="small" />
                                </div>
                            ) : (
                                type === "signup" ? "Sign up" : "Sign In"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
}

interface LabeledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;

}

function LabeledInput({ label, placeholder, onChange, type }: LabeledInputType) {
    return <div>
        <label className="block mb-2 text-sm font-semibold text-black">{label}</label>
        <input
            onChange={onChange}
            type={type || "text"}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-3"
            placeholder={placeholder}
            required
        />
    </div>
}