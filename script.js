const form = document.getElementById("requestForm");

// Centralized API endpoint URL
const API_ENDPOINT = 'https://citizen-report-system-backend.onrender.com/api/v1/report';

// Function to handle API request
const sendReport = async (requestData) => {
    try {
        // Log the request data to ensure all fields are present
        for (let [key, value] of Object.entries(requestData)) {
            console.log(key, value);
        }
        

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            body: requestData,  
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
};


// Handle form submission
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // Ensure all required fields are filled out
    const requiredFields = ['name', 'email', 'phone', 'category', 'description', 'image'];
    for (const field of requiredFields) {
        if (!formData.get(field)) {
            alert(`Please fill out the ${field} field.`);
            return;
        }
    }

    // Get geolocation
    let position = null;
    try {
        position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    } catch (geoError) {
        console.error("Geolocation Error:", geoError);
        // Fallback to IP-based geolocation if geolocation fails
        try {
            const ipResponse = await fetch('http://ip-api.com/json');
            const ipData = await ipResponse.json();

            position = {
                coords: {
                    latitude: ipData.lat,
                    longitude: ipData.lon,
                },
            };
        } catch (ipError) {
            console.error("IP Geolocation Error:", ipError);
            alert('Failed to determine your location. Please try again later.');
            return;
        }
    }

    // Add geolocation data to formData
    formData.append('latitude', position.coords.latitude.toString());
    formData.append('longitude', position.coords.longitude.toString());

    // Handle image upload (optional, as FormData already handles files)
    const imageFile = formData.get('image');
    if (imageFile) {
        const reader = new FileReader();
        try {
            const imageData = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });
            formData.append('image', imageData); // This may not be necessary, FormData will handle the file
        } catch (imageError) {
            console.error('Image Upload Error:', imageError);
            alert('Failed to upload the image. Please try again.');
            return;
        }
    }

    // Send the report
    try {
        const response = await sendReport(formData); // Pass the FormData object here

        if (response.ok) {
            alert('Report submitted successfully!');
            // form.reset();
        } else {
            alert('Failed to submit the report. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }
});


// Handle category change for "Others" option
const inputCategory = document.getElementById("input-category");
const inputCategoryLabel = document.getElementById("input-category-label");
const category = document.getElementById("category");

category.addEventListener("change", (e) => {
    if (e.target.value === "others") {
        inputCategory.style.display = "block";
        inputCategoryLabel.style.display = "block";
        inputCategory.setAttribute("required", "true");
    } else {
        inputCategory.style.display = "none";
        inputCategoryLabel.style.display = "none";
        inputCategory.removeAttribute("required");
    }
});
