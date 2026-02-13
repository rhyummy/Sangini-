import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("patient")
  const [fullName, setFullName] = useState("")

  const handleSignup = async (e) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    if (data.user) {
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          role: role,
        })

      if (insertError) {
        alert(insertError.message)
      } else {
        alert("Signup successful")
      }
    }
  }

  return (
    <form onSubmit={handleSignup}>
      <input placeholder="Full Name" onChange={(e) => setFullName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="volunteer">Volunteer</option>
      </select>

      <button type="submit">Sign Up</button>
    </form>
  )
}
