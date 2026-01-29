// 指数配置数据
const indexData = [
    {
        name: '动漫游戏',
        code: '930901',
        pe30: 41.41,
        pe70: 47.69,
        minPE: 35,
        maxPE: 55
    },
    {
        name: '中证银行',
        code: '399986',
        pe30: 6.64,
        pe70: 7.25,
        minPE: 5.5,
        maxPE: 8.5
    },
    {
        name: '沪深300',
        code: '000300',
        pe30: 12.73,
        pe70: 14.03,
        minPE: 11,
        maxPE: 16
    },
    {
        name: '中国互联网50',
        code: 'H30533',
        pe30: 18.30,
        pe70: 19.84,
        minPE: 16,
        maxPE: 22
    }
];

// 计算分位值
function calculatePercentile(currentPE, pe30, pe70, minPE, maxPE) {
    if (currentPE <= pe30) {
        return ((currentPE - minPE) / (pe30 - minPE)) * 30;
    } else if (currentPE <= pe70) {
        return 30 + ((currentPE - pe30) / (pe70 - pe30)) * 40;
    } else {
        return 70 + ((currentPE - pe70) / (maxPE - pe70)) * 30;
    }
}

// 获取估值状态
function getValuationStatus(percentile) {
    if (percentile < 30) return { text: '低估区域', color: '#4ade80' };
    if (percentile < 40) return { text: '低估边缘', color: '#86efac' };
    if (percentile < 60) return { text: '合理偏低', color: '#fbbf24' };
    if (percentile < 70) return { text: '合理偏高', color: '#fcd34d' };
    if (percentile < 85) return { text: '高估区域', color: '#f87171' };
    return { text: '严重高估', color: '#dc2626' };
}

// 更新可视化 - 只根据分位百分比显示竖线位置
function updateVisualization(card) {
    const percentileDisplay = card.querySelector('.percentile-display');
    const percentile = parseFloat(percentileDisplay.value) || 0;
    
    // 更新状态文本
    const status = getValuationStatus(percentile);
    const statusText = card.querySelector('.status-text');
    statusText.textContent = status.text;
    statusText.style.color = status.color;
    
    // 进度条固定：30%绿色，40%黄色，30%红色
    const lowSection = card.querySelector('.bar-section.low');
    const normalSection = card.querySelector('.bar-section.normal');
    const highSection = card.querySelector('.bar-section.high');
    
    lowSection.style.flex = '30';
    normalSection.style.flex = '40';
    highSection.style.flex = '30';
    
    // 当前PE标记位置根据分位百分比显示
    const marker = card.querySelector('.current-marker');
    marker.style.left = Math.min(Math.max(percentile, 0), 100) + '%';
}

// 手动更新分位时更新可视化
function updateVisualizationFromPercentile(card) {
    updateVisualization(card);
}

// 更新分位数据
function updatePercentileData(card, index) {
    const pe30Input = card.querySelector('.pe30-input');
    const pe70Input = card.querySelector('.pe70-input');
    
    // 更新数据
    indexData[index].pe30 = parseFloat(pe30Input.value);
    indexData[index].pe70 = parseFloat(pe70Input.value);
    
    // 注意：修改30和70分位值时，不重新计算当前分位
    // 当前分位保持不变，只有修改当前PE时才会重新计算分位
}

// 股票计算器功能
function updateCalculator() {
    const stockPrice = parseFloat(document.querySelector('.stock-price-input').value) || 0;
    const priceChange = parseFloat(document.querySelector('.price-change-input').value) || 0;
    const sharesInput = parseFloat(document.querySelector('.shares-input').value) || 0;
    const amountInput = parseFloat(document.querySelector('.amount-input').value) || 0;
    
    // 计算波动后的价格
    const changedPrice = stockPrice * (1 + priceChange / 100);
    document.querySelector('.price-change-result').textContent = '¥' + changedPrice.toFixed(3);
    
    // 根据股数计算金额
    const actualShares = sharesInput * 100; // 1手 = 100股
    const totalAmount = actualShares * stockPrice;
    
    document.querySelector('.actual-shares').textContent = actualShares.toLocaleString();
    document.querySelector('.amount-result').textContent = '¥' + totalAmount.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    // 根据金额计算股数
    if (stockPrice > 0) {
        const maxShares = Math.floor(amountInput / stockPrice);
        const adjustedShares = Math.floor(maxShares / 100) * 100; // 调整到100的倍数
        const adjustedAmount = adjustedShares * stockPrice;
        const remaining = amountInput - adjustedAmount;
        
        document.querySelector('.buyable-shares').textContent = adjustedShares.toLocaleString();
        document.querySelector('.adjusted-amount').textContent = '¥' + adjustedAmount.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.querySelector('.remaining-amount').textContent = '¥' + remaining.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
}

// 股份计算器功能
function updateShareCalculator() {
    const aOld = parseFloat(document.querySelector('.a-old-input').value) || 0;
    const bOld = parseFloat(document.querySelector('.b-old-input').value) || 0;
    const profitLoss = parseFloat(document.querySelector('.profit-loss-input').value) || 0;
    const aNew = parseFloat(document.querySelector('.a-new-input').value) || 0;
    const bNew = parseFloat(document.querySelector('.b-new-input').value) || 0;
    
    // 计算原投入总额
    const oldTotal = aOld + bOld;
    
    // 计算当前资产价值（原投入 + 盈亏）
    const currentValue = oldTotal + profitLoss;
    
    // 计算新增投入总额
    const newTotal = aNew + bNew;
    
    // 计算最终总资产
    const finalTotal = currentValue + newTotal;
    
    // 计算A和B的权益
    // A的权益 = (当前资产价值 × A原投入占比) + A新增投入
    // B的权益 = (当前资产价值 × B原投入占比) + B新增投入
    let aEquity = 0;
    let bEquity = 0;
    
    if (oldTotal > 0) {
        aEquity = (currentValue * (aOld / oldTotal)) + aNew;
        bEquity = (currentValue * (bOld / oldTotal)) + bNew;
    } else {
        aEquity = aNew;
        bEquity = bNew;
    }
    
    // 计算盈亏百分比
    const aTotalInvest = aOld + aNew;
    const bTotalInvest = bOld + bNew;
    
    let aProfitPercent = 0;
    let bProfitPercent = 0;
    
    if (aTotalInvest > 0) {
        aProfitPercent = ((aEquity - aTotalInvest) / aTotalInvest) * 100;
    }
    
    if (bTotalInvest > 0) {
        bProfitPercent = ((bEquity - bTotalInvest) / bTotalInvest) * 100;
    }
    
    // 更新计算过程显示
    document.querySelector('.old-total-result').textContent = oldTotal.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.querySelector('.current-value-result').textContent = currentValue.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.querySelector('.new-total-result').textContent = newTotal.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.querySelector('.final-total-result').textContent = finalTotal.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    document.querySelector('.a-equity-result').textContent = aEquity.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.querySelector('.b-equity-result').textContent = bEquity.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    // 计算股份比例
    let aPercentage = 0;
    let bPercentage = 0;
    
    if (finalTotal > 0) {
        aPercentage = (aEquity / finalTotal) * 100;
        bPercentage = (bEquity / finalTotal) * 100;
    }
    
    document.querySelector('.a-percentage-result').textContent = aPercentage.toFixed(7) + '%';
    document.querySelector('.b-percentage-result').textContent = bPercentage.toFixed(7) + '%';
    document.querySelector('.a-money-result').textContent = '¥' + aEquity.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.querySelector('.b-money-result').textContent = '¥' + bEquity.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    // 更新盈亏百分比
    const aProfitElement = document.querySelector('.a-profit-percent');
    const bProfitElement = document.querySelector('.b-profit-percent');
    
    aProfitElement.textContent = (aProfitPercent >= 0 ? '+' : '') + aProfitPercent.toFixed(2) + '%';
    aProfitElement.className = 'profit-percent a-profit-percent ' + (aProfitPercent >= 0 ? 'positive' : 'negative');
    
    bProfitElement.textContent = (bProfitPercent >= 0 ? '+' : '') + bProfitPercent.toFixed(2) + '%';
    bProfitElement.className = 'profit-percent b-profit-percent ' + (bProfitPercent >= 0 ? 'positive' : 'negative');
}

// 切换区域折叠
function toggleZone(titleElement) {
    const content = titleElement.nextElementSibling;
    content.classList.toggle('collapsed');
    titleElement.classList.toggle('collapsed');
}

// 切换股份计算器模态框
function toggleShareCalcModal() {
    const modal = document.querySelector('.share-calc-modal');
    modal.classList.toggle('show');
}

// 切换指南显示
function toggleGuide() {
    const guideContent = document.querySelector('.guide-content');
    const guideToggle = document.querySelector('.guide-toggle');
    
    guideContent.classList.toggle('show');
    guideToggle.classList.toggle('active');
}

// 切换指南编辑模式
function toggleGuideEdit() {
    const cells = document.querySelectorAll('.guide-table .editable-cell');
    const editBtn = document.querySelector('.guide-edit-btn');
    const isEditing = editBtn.classList.contains('active');
    
    if (isEditing) {
        // 保存模式
        cells.forEach(cell => {
            const text = cell.textContent;
            cell.contentEditable = 'false';
            cell.classList.remove('editing');
            // 保存到localStorage
            localStorage.setItem('guide_' + cell.dataset.key, text);
        });
        editBtn.classList.remove('active');
        editBtn.innerHTML = '🔧';
        editBtn.title = '编辑说明';
    } else {
        // 编辑模式
        cells.forEach(cell => {
            cell.contentEditable = 'true';
            cell.classList.add('editing');
        });
        editBtn.classList.add('active');
        editBtn.innerHTML = '✓';
        editBtn.title = '保存修改';
    }
}

// 加载保存的指南内容
function loadGuideContent() {
    const cells = document.querySelectorAll('.guide-table .editable-cell');
    cells.forEach(cell => {
        const savedText = localStorage.getItem('guide_' + cell.dataset.key);
        if (savedText) {
            cell.textContent = savedText;
        }
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 计算器事件
    const stockPriceInput = document.querySelector('.stock-price-input');
    const priceChangeInput = document.querySelector('.price-change-input');
    const sharesInput = document.querySelector('.shares-input');
    const amountInput = document.querySelector('.amount-input');
    
    stockPriceInput.addEventListener('input', updateCalculator);
    priceChangeInput.addEventListener('input', updateCalculator);
    sharesInput.addEventListener('input', updateCalculator);
    amountInput.addEventListener('input', updateCalculator);
    
    // 初始化计算器
    updateCalculator();
    
    // 股份计算器事件
    const aOldInput = document.querySelector('.a-old-input');
    const bOldInput = document.querySelector('.b-old-input');
    const profitLossInput = document.querySelector('.profit-loss-input');
    const aNewInput = document.querySelector('.a-new-input');
    const bNewInput = document.querySelector('.b-new-input');
    
    aOldInput.addEventListener('input', updateShareCalculator);
    bOldInput.addEventListener('input', updateShareCalculator);
    profitLossInput.addEventListener('input', updateShareCalculator);
    aNewInput.addEventListener('input', updateShareCalculator);
    bNewInput.addEventListener('input', updateShareCalculator);
    
    // 初始化股份计算器
    updateShareCalculator();
    
    // 股份计算器模态框按钮
    const shareCalcToggleBtn = document.querySelector('.share-calc-toggle-btn');
    const shareCalcCloseBtn = document.querySelector('.share-calc-close-btn');
    const shareCalcModal = document.querySelector('.share-calc-modal');
    
    shareCalcToggleBtn.addEventListener('click', toggleShareCalcModal);
    shareCalcCloseBtn.addEventListener('click', toggleShareCalcModal);
    
    // 点击模态框背景关闭
    shareCalcModal.addEventListener('click', (e) => {
        if (e.target === shareCalcModal) {
            toggleShareCalcModal();
        }
    });
    
    // 指南按钮事件
    const guideToggle = document.querySelector('.guide-toggle');
    guideToggle.addEventListener('click', toggleGuide);
    
    // 指南编辑按钮事件
    const guideEditBtn = document.querySelector('.guide-edit-btn');
    guideEditBtn.addEventListener('click', toggleGuideEdit);
    
    // 加载保存的指南内容
    loadGuideContent();
    
    const cards = document.querySelectorAll('.index-card');
    
    cards.forEach((card, index) => {
        const percentileDisplay = card.querySelector('.percentile-display');
        
        // 初始化显示
        updateVisualization(card);
        
        // 只监听分位输入变化，其他输入框只是显示用
        percentileDisplay.addEventListener('input', () => {
            updateVisualization(card);
        });
    });
});
