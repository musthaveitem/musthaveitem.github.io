document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation & Scroll (Existing Code) ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const spans = hamburger.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('open'));
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === "#") return; // Skip if it's just "#"

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // --- Scroll Transitions (Existing) ---
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.section, .banner-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.9)';
            navbar.style.boxShadow = 'none';
        }
    });

    // --- Google Sign-In (Existing) ---
    window.onload = function () {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: "YOUR_GOOGLE_CLIENT_ID_HERE",
                callback: handleCredentialResponse
            });
            google.accounts.id.renderButton(
                document.getElementById("g_id_signin"),
                { theme: "outline", size: "large" }
            );
            // google.accounts.id.prompt(); 
        }
    }

    function handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
        alert("로그인 성공! (콘솔에서 토큰 확인 가능)");
    }


    // --- Estimate Generator Logic ---
    const itemsContainer = document.getElementById('items-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const printBtn = document.getElementById('print-btn');

    // Inputs (Global for estimate)
    const recipientInput = document.getElementById('est-recipient');
    const dateInput = document.getElementById('est-date');
    const totalPriceInput = document.getElementById('est-total-price'); // Manual override or simple input

    // Preview Elements
    const previewRecipient = document.getElementById('preview-recipient');
    const previewDate = document.getElementById('preview-date');
    const previewTbody = document.getElementById('preview-tbody');
    const previewTotalKorean = document.getElementById('preview-total-korean');
    const previewTotalNum = document.getElementById('preview-total-num');
    const previewSupplyTotal = document.getElementById('preview-supply-total');
    const previewTaxTotal = document.getElementById('preview-tax-total');

    // Init Date
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) dateInput.value = today;
    updatePreview();

    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
            addItemRow();
            updatePreview();
        });
        // Add one initial row
        addItemRow();
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Event Listeners for inputs
    if (recipientInput) recipientInput.addEventListener('input', updatePreview);
    if (dateInput) dateInput.addEventListener('change', updatePreview);
    if (totalPriceInput) totalPriceInput.addEventListener('input', updatePreview);

    function addItemRow() {
        if (!itemsContainer) return;
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `
            <input type="text" class="input-name" placeholder="품명">
            <input type="number" class="input-qty" placeholder="수량" value="1" min="1">
            <input type="number" class="input-price" placeholder="단가" value="0" step="100">
            <button class="remove-btn">x</button>
        `;
        itemsContainer.appendChild(div);

        // Add listeners to new inputs
        div.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updatePreview);
        });
        div.querySelector('.remove-btn').addEventListener('click', () => {
            div.remove();
            updatePreview();
        });
    }

    function updatePreview() {
        if (!previewRecipient) return;

        // Recipient
        previewRecipient.innerText = recipientInput.value || "귀하";

        // Date
        const d = new Date(dateInput.value || Date.now());
        previewDate.innerText = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;

        // Rows
        previewTbody.innerHTML = '';
        let totalSupply = 0;
        let totalTax = 0;

        const rows = document.querySelectorAll('.item-row');
        rows.forEach(row => {
            const name = row.querySelector('.input-name').value;
            const qty = parseInt(row.querySelector('.input-qty').value) || 0;
            const price = parseInt(row.querySelector('.input-price').value) || 0;

            if (name) {
                const supply = qty * price;
                const tax = Math.round(supply * 0.1);

                totalSupply += supply;
                totalTax += tax;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${name}</td>
                    <td>-</td>
                    <td>${qty}</td>
                    <td>${Number(price).toLocaleString()}</td>
                    <td>${Number(supply).toLocaleString()}</td>
                    <td>${Number(tax).toLocaleString()}</td>
                    <td></td>
                `;
                previewTbody.appendChild(tr);
            }
        });

        // Totals
        let grandTotal = totalSupply + totalTax;

        // If manual total price is entered, use it instead (Manual Override)
        if (totalPriceInput && totalPriceInput.value) {
            grandTotal = parseInt(totalPriceInput.value) || 0;
            // Recalculate supply and tax from grand total roughly if needed, 
            // but for now just update the grand total display for visibility
        }

        previewSupplyTotal.innerText = Number(totalSupply).toLocaleString();
        previewTaxTotal.innerText = Number(totalTax).toLocaleString();
        previewTotalNum.innerText = `(\\ ${Number(grandTotal).toLocaleString()})`;

        // Number to Korean
        previewTotalKorean.innerText = "일금 " + numberToKorean(grandTotal) + " 원정";
    }

    function numberToKorean(number) {
        if (number === 0) return "영";
        const units = ['', '십', '백', '천'];
        const terms = ['', '만', '억', '조'];
        let result = '';
        let str = number.toString();
        let len = str.length;

        for (let i = 0; i < len; i++) {
            let n = parseInt(str[i]);
            let digit = len - i - 1;
            let unitIndex = digit % 4;
            let termIndex = Math.floor(digit / 4);

            if (n > 0) {
                result += (n === 1 && unitIndex > 0 ? '' : numChar(n)) + units[unitIndex];
            }
            if (unitIndex === 0 && (i === len - 1 || parseInt(str.substring(Math.max(0, i - 3), i + 1)) > 0)) {
                // Add term if the 4-digit block has any non-zero value
                const blockValue = parseInt(str.substring(Math.max(0, i - 3), i + 1));
                if (blockValue > 0) {
                    result += terms[termIndex] + ' ';
                }
            }
        }
        return result.trim();
    }

    function numChar(n) {
        return ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'][n];
    }

    // --- Calculator Logic ---
    const calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
    };

    function updateDisplay() {
        const display = document.querySelector('.calc-screen');
        if (display) display.value = calculator.displayValue;
    }

    updateDisplay();

    const keys = document.querySelector('.calc-keys');
    if (keys) {
        keys.addEventListener('click', (event) => {
            const { target } = event;
            if (!target.matches('button')) {
                return;
            }

            if (target.classList.contains('operator')) {
                handleOperator(target.value);
                updateDisplay();
                return;
            }

            if (target.classList.contains('decimal')) {
                inputDecimal(target.value);
                updateDisplay();
                return;
            }

            if (target.classList.contains('clear')) {
                resetCalculator();
                updateDisplay();
                return;
            }

            if (target.classList.contains('equal-sign')) {
                handleOperator(target.value); // Perform final calc
                updateDisplay();
                return;
            }

            inputDigit(target.value);
            updateDisplay();
        });
    }

    function inputDigit(digit) {
        const { displayValue, waitingForSecondOperand } = calculator;

        if (waitingForSecondOperand === true) {
            calculator.displayValue = digit;
            calculator.waitingForSecondOperand = false;
        } else {
            calculator.displayValue = displayValue === '0' ? digit : displayValue + digit;
        }
    }

    function inputDecimal(dot) {
        if (calculator.waitingForSecondOperand === true) {
            calculator.displayValue = "0."
            calculator.waitingForSecondOperand = false;
            return;
        }
        if (!calculator.displayValue.includes(dot)) {
            calculator.displayValue += dot;
        }
    }

    function handleOperator(nextOperator) {
        const { firstOperand, displayValue, operator } = calculator;
        const inputValue = parseFloat(displayValue);

        if (operator && calculator.waitingForSecondOperand) {
            calculator.operator = nextOperator;
            return;
        }

        if (firstOperand == null && !isNaN(inputValue)) {
            calculator.firstOperand = inputValue;
        } else if (operator) {
            const result = performCalculation[operator](firstOperand, inputValue);
            calculator.displayValue = `${parseFloat(result.toFixed(7))}`;
            calculator.firstOperand = result;
        }

        calculator.waitingForSecondOperand = true;
        calculator.operator = nextOperator;
    }

    const performCalculation = {
        '/': (firstOperand, secondOperand) => firstOperand / secondOperand,
        '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
        '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
        '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
        '=': (firstOperand, secondOperand) => secondOperand
    };

    function resetCalculator() {
        calculator.displayValue = '0';
        calculator.firstOperand = null;
        calculator.waitingForSecondOperand = false;
        calculator.operator = null;
    }

    // --- Parcel Tracking Logic ---
    const trackBtn = document.getElementById('track-btn');
    const courierSelect = document.getElementById('courier-select');
    const trackingNumberInput = document.getElementById('tracking-number');

    if (trackBtn) {
        trackBtn.addEventListener('click', () => {
            const courier = courierSelect.value;
            const trackingNumber = trackingNumberInput.value.trim();

            if (!trackingNumber) {
                alert('운송장 번호를 입력해주세요.');
                return;
            }

            let url = '';

            switch (courier) {
                case 'cj':
                    url = `https://trace.cjlogistics.com/next/tracking.html?wblNo=${trackingNumber}`;
                    break;
                case 'epost':
                    url = `https://service.epost.go.kr/trace.RetrieveDomRgiTraceList.comm?sid1=${trackingNumber}`;
                    break;
                case 'hanjin':
                    url = `https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLang=KR&wblnum=${trackingNumber}`;
                    break;
                case 'lotte':
                    url = `https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=${trackingNumber}`;
                    break;
                case 'logen':
                    url = `https://www.ilogen.com/web/personal/trace/${trackingNumber}`;
                    break;
                case 'kyungdong':
                    url = `https://kdexp.com/service/delivery/etc/delivery.do?barcode=${trackingNumber}`;
                    break;
                case 'chunil':
                    url = `http://www.chunil.co.kr/HTrace/HTrace.jsp?transNo=${trackingNumber}`;
                    break;
                default:
                    alert('지원하지 않는 택배사입니다.');
                    return;
            }

            window.open(url, '_blank');
        });
    }
});
