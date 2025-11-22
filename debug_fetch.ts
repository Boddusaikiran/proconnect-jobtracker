

async function check() {
    try {
        const res = await fetch("http://localhost:5178/api/coding/problems");
        const data = await res.json();
        console.log("Is array?", Array.isArray(data));
        if (Array.isArray(data)) {
            console.log("Length:", data.length);
            console.log("First item:", data[0].title);
        } else {
            console.log("Data keys:", Object.keys(data));
        }
    } catch (e) {
        console.error(e);
    }
}

check();
