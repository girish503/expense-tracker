window.onload = function() {
    // --- Page Elements ---
    const loginPage = document.getElementById('login-page');
    const mainPage = document.getElementById('main-page');
    const loginForm = document.getElementById('login-form');
    const nameInput = document.getElementById('name-input');
    const userNameDisplay = document.getElementById('user-name-display');

    // --- Login Page 3D Background ---
    setupLoginBackground();

    // --- Handle Login ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userName = nameInput.value.trim();
        if (userName) {
            userNameDisplay.textContent = userName;
            loginPage.classList.add('hidden');
            mainPage.classList.remove('hidden');
            // Initialize main page components
            setupMainPage();
        }
    });

    // --- Main Page Logic ---
    let transactions = [];
    let mainScene, mainCamera, mainRenderer, currencySymbols = [];

    function setupMainPage() {
        // Initialize 3D currency background
        setupMainBackground();
        // Initialize transaction handling
        initTransactionLogic();
    }

    function initTransactionLogic() {
        const transactionForm = document.getElementById('transaction-form');
        const amountInput = document.getElementById('amount');
        const descriptionInput = document.getElementById('description');
        const typeInput = document.getElementById('type');

        // Load some initial data for demonstration
        transactions = [
            { id: 1, description: 'Salary', amount: 50000, type: 'income' },
            { id: 2, description: 'Rent', amount: 15000, type: 'expense' },
            { id: 3, description: 'Groceries', amount: 7500, type: 'expense' },
        ];
        
        renderTransactions();

        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTransaction = {
                id: Date.now(),
                description: descriptionInput.value,
                amount: parseFloat(amountInput.value),
                type: typeInput.value
            };

            if (newTransaction.description && newTransaction.amount > 0) {
                transactions.push(newTransaction);
                renderTransactions();
                transactionForm.reset();
                typeInput.value = 'expense'; // Reset select to default
            }
        });
    }

    function renderTransactions() {
        const list = document.getElementById('transaction-list');
        list.innerHTML = ''; // Clear current list

        if (transactions.length === 0) {
            list.innerHTML = `<p class="text-gray-500 text-center py-4">No transactions yet.</p>`;
            updateSummary();
            return;
        }
        
        // Sort by most recent first
        const sortedTransactions = [...transactions].reverse();

        sortedTransactions.forEach(tx => {
            const isIncome = tx.type === 'income';
            const item = document.createElement('div');
            item.className = 'grid grid-cols-3 md:grid-cols-4 items-center p-3 rounded-lg bg-gray-50';
            item.innerHTML = `
                <div class="col-span-2 md:col-span-2 flex items-center">
                    <div class="mr-3 p-2 rounded-full ${isIncome ? 'bg-green-100' : 'bg-red-100'}">
                        <span class="text-xl">${isIncome ? '💸' : '🛍️'}</span>
                    </div>
                    <div>
                        <p class="font-bold">${tx.description}</p>
                        <p class="text-sm text-gray-500">${isIncome ? 'Income' : 'Expense'}</p>
                    </div>
                </div>
                <p class="font-bold text-right ${isIncome ? 'text-green-600' : 'text-red-600'}">
                    ${isIncome ? '+' : '-'}₹${tx.amount.toFixed(2)}
                </p>
                <div class="text-right">
                    <button class="text-gray-400 hover:text-red-500" onclick="deleteTransaction(${tx.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            `;
            list.appendChild(item);
        });

        updateSummary();
    }
    
    window.deleteTransaction = (id) => {
        transactions = transactions.filter(tx => tx.id !== id);
        renderTransactions();
    }

    function updateSummary() {
        const income = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const expense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
        const balance = income - expense;

        document.getElementById('total-income').textContent = `₹${income.toFixed(2)}`;
        document.getElementById('total-expense').textContent = `₹${expense.toFixed(2)}`;
        document.getElementById('balance').textContent = `₹${balance.toFixed(2)}`;
    }

    // --- 3D Background Functions ---

    function setupLoginBackground() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('login-bg-canvas'), alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const shapes = [];
        const geometry = new THREE.IcosahedronGeometry(1, 0);
        const material = new THREE.MeshStandardMaterial({ color: 0x60a5fa, metalness: 0.1, roughness: 0.6, transparent: true, opacity: 0.5 });
        for (let i = 0; i < 20; i++) {
            const shape = new THREE.Mesh(geometry, material);
            shape.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20 - 5);
            const scale = Math.random() * 0.3 + 0.2;
            shape.scale.set(scale, scale, scale);
            shapes.push(shape);
            scene.add(shape);
        }
        camera.position.z = 5;

        function animate() {
            requestAnimationFrame(animate);
            shapes.forEach(s => { s.rotation.x += 0.001; s.rotation.y += 0.002; });
            renderer.render(scene, camera);
        }
        animate();
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    function setupMainBackground() {
        mainScene = new THREE.Scene();
        mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        mainRenderer = new THREE.WebGLRenderer({ canvas: document.getElementById('main-bg-canvas'), alpha: true });
        mainRenderer.setSize(window.innerWidth, window.innerHeight);
        mainRenderer.setPixelRatio(window.devicePixelRatio);
        
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        mainScene.add(light);
        mainScene.add(new THREE.AmbientLight(0xffffff, 0.5));

        const loader = new THREE.FontLoader();
        loader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json', function (font) {
            const currencies = ['₹', '$', '€', '£'];
            const colors = [0x22c55e, 0xef4444, 0x3b82f6, 0xeab308]; // green, red, blue, yellow

            for (let i = 0; i < 40; i++) {
                const char = currencies[i % currencies.length];
                const color = colors[i % colors.length];
                const textGeo = new THREE.TextGeometry(char, {
                    font: font, size: 0.5, height: 0.1,
                });
                const textMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4 });
                const mesh = new THREE.Mesh(textGeo, textMat);
                
                mesh.position.x = (Math.random() - 0.5) * 20;
                mesh.position.y = (Math.random() - 0.5) * 20;
                mesh.position.z = (Math.random() - 0.5) * 20;
                mesh.rotation.x = Math.random() * 2 * Math.PI;
                mesh.rotation.y = Math.random() * 2 * Math.PI;
                mesh.userData.velocity = new THREE.Vector3(0, 0.01 + Math.random() * 0.01, 0);

                currencySymbols.push(mesh);
                mainScene.add(mesh);
            }
        });

        mainCamera.position.z = 10;
        animateMainBackground();
        window.addEventListener('resize', onWindowResizeMain, false);
    }

    function animateMainBackground() {
        requestAnimationFrame(animateMainBackground);
        currencySymbols.forEach(symbol => {
            symbol.position.add(symbol.userData.velocity);
            symbol.rotation.y += 0.01;
            if (symbol.position.y > 10) {
                symbol.position.y = -10;
                symbol.position.x = (Math.random() - 0.5) * 20;
            }
        });
        mainRenderer.render(mainScene, mainCamera);
    }

    function onWindowResizeMain() {
        mainCamera.aspect = window.innerWidth / window.innerHeight;
        mainCamera.updateProjectionMatrix();
        mainRenderer.setSize(window.innerWidth, window.innerHeight);
    }
};
