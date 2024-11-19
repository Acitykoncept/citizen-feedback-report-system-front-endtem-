const form = document.getElementById("requestForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    
    // Get geolocation
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Prepare the request data
        const requestData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phoneNumber: formData.get('phone'),
            category: formData.get('category') === 'others' ? formData.get('input-category') : formData.get('category'),
            description: formData.get('description'),
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
        };

        // Handle image upload
        const imageFile = formData.get('image');
        if (imageFile) {
            const reader = new FileReader();
            const imageData = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(imageFile);
            });
            requestData.image = imageData;
        }

        // Send the request
        const response = await fetch('http://localhost:3000/api/v1/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestData)
        });

        if (response.ok) {
            alert('Report submitted successfully!');
            form.reset();
        } else {
            throw new Error('Failed to submit report');
        }

    } catch (error) {
        console.error('Error:', error);
        // Fallback to IP-based geolocation
        try {
            const ipResponse = await fetch('http://ip-api.com/json');
            const ipData = await ipResponse.json();
            
            // Retry submission with IP-based location
            const requestData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phoneNumber: formData.get('phone'),
                category: formData.get('category') === 'others' ? formData.get('input-category') : formData.get('category'),
                description: formData.get('description'),
                latitude: ipData.lat.toString(),
                longitude: ipData.lon.toString()
            };

            const response = await fetch('http://localhost:3000/api/v1/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(requestData)
            });

            if (response.ok) {
                alert('Report submitted successfully!');
                form.reset();
            } else {
                alert('Failed to submit report. Please try again.');
            }
        } catch (ipError) {
            console.error('IP Geolocation Error:', ipError);
            alert('Failed to get location. Please try again.');
        }
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