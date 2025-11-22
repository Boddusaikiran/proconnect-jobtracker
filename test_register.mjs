const data = {
    fullName: "Test User",
    username: "testuser123",
    email: "testuser123@example.com",
    password: "password123",
    headline: "Developer",
    role: "candidate"
};

console.log("Sending registration request with data:", JSON.stringify(data, null, 2));

try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    const responseData = await response.json();
    console.log("Response body:", JSON.stringify(responseData, null, 2));
} catch (error) {
    console.error("Error:", error.message);
}
