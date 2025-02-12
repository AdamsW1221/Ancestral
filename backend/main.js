const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return 'Please enter a valid email';
    return !email ? 'Enter an email address' : '';
};

const dataTemplate = (data, index) => {
    const dataTypes = data.xposed_data.split(';').map(item => item.trim());
    const dataCounts = {};

    dataTypes.forEach(type => {
        if (!dataCounts[type]) dataCounts[type] = 0;
        dataCounts[type]++;
    });

    const dataSummary = `
        <strong>email address: ${dataCounts["Email addresses"] || 0}</strong>  
        <strong>Password: ${dataCounts["Passwords"] || 0}</strong>  
        <strong>IP address: ${dataCounts["IP addresses"] || 0}</strong>
    `;

    return `
    <div class="ms:mx-4 md:mx-6 mx-6  shadow-lg rounded-md overflow-hidden my-4 transition-all duration-500 ease-in transform opacity-0 translate-y-4 hover:translate-y-0">
        <div class="border-4 border-indigo-500 ">
            <input type="checkbox" id="acordeon-${index}" class="hidden">
            <label for="acordeon-${index}" class="flex justify-between items-center p-4 cursor-pointer ">
                <span class="font-semibold">${data.breach}</span>
                <div class="flex space-x-6">
                    <span class="font-semibold">${data.xposed_date}</span>
                    <svg class="w-6 h-6 transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </label>
            <div id="content-${index}" class="overflow-hidden transition-all duration-300 max-h-0">
                <div class="p-4 pt-0">
                    <p class="text-gray-600 sm:line-clamp-5 md:line-clamp-4 ">${data.details}</p>
                    <div class="mt-2 text-sm text-gray-700">
                        <p>Ancestral found the following data exposed:</p>
                        <p class="mt-2">${dataSummary}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
};

const addAcordeonEvents = () => {
    const acordeones = document.querySelectorAll('input[type="checkbox"]');

    acordeones.forEach((acordeon) => {
        acordeon.addEventListener('change', (event) => {
            const contentId = `content-${event.target.id.split('-')[1]}`;
            const content = document.getElementById(contentId);

            if (content) {
                if (event.target.checked) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    content.style.maxHeight = '0';
                }
            } 
        });
    });
};

async function checkEmail() {
    const email = document.getElementById('email').value;
    const searchResult = document.getElementById('results');
    const searchError = document.getElementById('error');
    const messageData = document.getElementById('messageData');

    searchResult.innerHTML = '';
    messageData.innerHTML = '';
    searchError.textContent = validateEmail(email);
    
    if (searchError.textContent) return;

    try {
        const response = await fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (!data.ExposedBreaches || data.ExposedBreaches.breaches_details.length === 0) {
            messageData.innerHTML = `<p class="text-green-500">Good news! No data leaks were found for this email.</p>`;
            return; 
        }

        const uniqueDataTypes = new Set(); 

        data.ExposedBreaches.breaches_details.forEach((element, index) => {
            element.xposed_data.split(';').forEach(dataType => {
                uniqueDataTypes.add(dataType.trim()); 
            });

            messageData.innerHTML = `Total data types filtered: ${uniqueDataTypes.size}`;
            searchResult.innerHTML += dataTemplate(element, index);
        });

        setTimeout(() => {
            const carruseles = document.querySelectorAll('#results > div');
            carruseles.forEach((carrusel) => {
                carrusel.classList.remove('opacity-0', 'translate-y-4');
            });
        }, 10); 

        addAcordeonEvents();
    } catch (error) {
        console.log('Error al consultar la API', error);
        messageData.innerHTML = `<p class="text-red-500">There was an error. Please try again later.</p>`;
    }
}


const themeSwitch = document.getElementById('theme-switch');
const body = document.getElementById('body');
const navbar = document.getElementById('navbar');
const messageData = document.getElementById('messageData');
const results = document.getElementById('results');

themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        body.classList.remove('bg-[#f9f9fa]');
        body.classList.add('bg-[#030712]');
        navbar.classList.remove('bg-white')
        navbar.classList.add('bg-[#080d19]')
        messageData.classList.remove('text-indigo-500')
        messageData.classList.add('text-white')
        results.classList.add('text-white')
        
 
    } else {
        body.classList.remove('bg-[#030712]');
        body.classList.add('bg-[#f9f9fa]');
        navbar.classList.remove('bg-[#080d19]')
        navbar.classList.add('bg-white')
        messageData.classList.remove('text-white')
        messageData.classList.add('text-indigo-500')
        results.classList.remove('text-white')
    }
});