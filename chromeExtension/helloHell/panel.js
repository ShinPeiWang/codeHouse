document.addEventListener('DOMContentLoaded', function () {
  let tabsWrap = document.getElementById('tabsWrap');
  let draggedTab = null;
  let draggedWindowId = null;

  // 获取固定 header 的高度
  const header = document.querySelector('#fixed-header');
  const headerHeight = header ? header.offsetHeight : 0;

  // 添加搜索框到页面顶部
  const searchInput = document.getElementById('searchInput');

  // 初始化滚动位置变量
  let lastScrollTop = 0;

  // 保存当前的滚动位置
  function saveScrollPosition() {
    lastScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  }

  // 恢复滚动位置
  function restoreScrollPosition() {
    document.documentElement.scrollTop = lastScrollTop;
    document.body.scrollTop = lastScrollTop;
  }

  // 搜索事件处理
  searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase();
    filterTabs(query);
  });

  function refreshTabsByWindows() {
    saveScrollPosition();

    tabsWrap.innerHTML = '';

    chrome.windows.getAll({ populate: true }, function (windows) {
      windows.forEach(function (win, idx) {
        const windowContainer = document.createElement('div');
        windowContainer.classList.add('windowContainer');

        const windowHeader = document.createElement('div');
        windowHeader.classList.add('windowHeader');

        let closeWindowButton = document.createElement('button');
        closeWindowButton.classList.add('closeWindowBtn');
        closeWindowButton.textContent = '👉 🗑️';
        closeWindowButton.title = '關閉視窗';

        const windowTitle = document.createElement('h2');
        windowTitle.innerText = `✨`;

        closeWindowButton.addEventListener('click', function () {
          chrome.windows.remove(win.id, function () {});
        });

        windowHeader.appendChild(windowTitle);
        windowHeader.appendChild(closeWindowButton);

        const windowList = document.createElement('ul');
        windowList.classList.add('ulContainer');
        windowList.addEventListener('dragover', function (e) {
          console.log('window dragover')
          handleDragOverUL(e, windowList);
        });

        windowList.addEventListener('dragleave', function (e) {
          console.log('window dragleave')
          removeClassOnLeave(e, windowList);
        });

        windowList.addEventListener('drop', function (e) {
          console.log('window drop')
        });

        win.tabs.forEach(function (tab, tabIndex) {
          let li = document.createElement('li');
          let item = document.createElement('div');
          item.classList.add('tabItem');
          li.setAttribute('draggable', true);
          li.classList.add('draggable-tab');

          li.dataset.tabId = tab.id;
          li.dataset.windowId = win.id;
          li.dataset.tabIndex = tabIndex;
          li.dataset.tabTitle = tab.title.toLowerCase();
          li.dataset.tabUrl = tab.url.toLowerCase();

          li.addEventListener('dragstart', function (e) {
            console.log('li dragstart')
            draggedTab = tab;
            draggedWindowId = win.id;
            li.classList.add('dragging');
          });

          li.addEventListener('dragend', function (e) {
            console.log('li dragend')
            li.classList.remove('dragging');
            draggedTab = null;
            draggedWindowId = null;
          });

          li.addEventListener('dragover', function (e) {
            console.log('li dragover')
            e.preventDefault();
            li.classList.add('drag-over');
            autoScrollOnDrag(e); // 调用自动滚动函数
          });

          li.addEventListener('dragleave', function (e) {
            console.log('li dragleave')
            li.classList.remove('drag-over');
          });

          // 在 drop 时处理将 tab 移动到最后的逻辑
          li.addEventListener('drop', function (e) {
            console.log('li drop', li);
            e.preventDefault();
            li.classList.remove('drag-over');

            let targetTabId = parseInt(li.dataset.tabId);
            let targetWindowId = parseInt(li.dataset.windowId);
            let targetTabIndex = parseInt(li.dataset.tabIndex);

            const ulRect = windowList.getBoundingClientRect();
            const distanceFromBottom = ulRect.bottom - e.clientY;
            if (windowList.classList.contains('drag-near-bottom')) {
              return;
            }
            if (draggedTab) {
              // 判断是否接近底部，如果接近底部5px内，则移动到 windowList 最后一笔
              if (windowList.classList.contains('drag-near-bottom')) {
                chrome.tabs.move(draggedTab.id, { index: -1 }, function () {
                  refreshTabsByWindows();
                });
              } else {
                // 正常拖拽到目标位置的逻辑
                if (draggedWindowId === targetWindowId) {
                  chrome.tabs.move(draggedTab.id, { index: targetTabIndex }, function () {
                    refreshTabsByWindows();
                  });
                } else {
                  chrome.tabs.move(draggedTab.id, { windowId: targetWindowId, index: targetTabIndex }, function () {
                    refreshTabsByWindows();
                  });
                }
              }
            }
          });

          li.addEventListener('click', function () {
            switchToTab(tab.id);
          });

          let openNewWindowButton = document.createElement('div');
          openNewWindowButton.textContent = '⮕';
          openNewWindowButton.title = '在新視窗開啟';
          openNewWindowButton.classList.add('open-window-button');

          let closeButton = document.createElement('div');
          closeButton.textContent = '❎';
          closeButton.title = '關閉';
          closeButton.classList.add('close-button');
          closeButton.style.marginLeft = '10px';

          let favicon = document.createElement('img');
          favicon.classList.add('favicon-img');
          favicon.src = tab.favIconUrl || './image/default_favicon.png';
          li.title = tab.url;

          let description = document.createElement('span');
          description.classList.add('tab-title');
          description.textContent = tab.title;

          closeButton.addEventListener('click', function (e) {
            e.stopPropagation();
            chrome.tabs.remove(tab.id, function () {
              li.remove();
              saveScrollPosition();
              restoreScrollPosition();
            });
          });

          openNewWindowButton.addEventListener('click', function (e) {
            e.stopPropagation();
            moveOnNewWindow(tab);
          });

          item.appendChild(favicon);
          item.appendChild(description);
          item.appendChild(openNewWindowButton);
          item.appendChild(closeButton);
          li.appendChild(item);
          windowList.appendChild(li);
        });

        windowContainer.appendChild(windowHeader);
        windowContainer.appendChild(windowList);
        tabsWrap.appendChild(windowContainer);
      });

      restoreScrollPosition();
    });
  }

  function handleDragOverUL(e, ulElement) {
    const ulRect = ulElement.getBoundingClientRect();
    const distanceFromBottom = ulRect.bottom - e.clientY;

    // 判断是否接近底部5px内
    if (distanceFromBottom <= 20) {
      ulElement.classList.add('drag-near-bottom');
    } else {
      ulElement.classList.remove('drag-near-bottom');
    }
  }

  function removeClassOnLeave(e, ulElement) {
    ulElement.classList.remove('drag-near-bottom');
  }

  function moveOnNewWindow(tab) {
    chrome.windows.create({ tabId: tab.id }, function (newWindow) {
      console.log(`Moved tab to new window with ID: ${newWindow?.id}`);
    });
  }

  function switchToTab(tabId) {
    chrome.tabs.update(tabId, { active: true }, function (tab) {
      chrome.windows.update(tab.windowId, { focused: true }, function () {
        console.log(`Switched to tab ID: ${tabId}`);
      });
    });
  }

  // 搜索过滤功能
  function filterTabs(query) {
    const allTabs = document.querySelectorAll('.draggable-tab');
    allTabs.forEach(tab => {
      const tabTitle = tab.dataset.tabTitle || '';
      const tabUrl = tab.dataset.tabUrl || '';
      if (tabTitle.includes(query) || tabUrl.includes(query)) {
        tab.style.display = 'block';
      } else {
        tab.style.display = 'none';
      }
    });
  }

  refreshTabsByWindows();

  const debounceRefresh = debounce(refreshTabsByWindows, 300);

  chrome.tabs.onCreated.addListener(function (tab) {
    debounceRefresh();
  });

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    debounceRefresh();
  });

  chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    debounceRefresh();
  });

  chrome.windows.onCreated.addListener(function (window) {
    debounceRefresh();
  });

  chrome.windows.onRemoved.addListener(function (windowId) {
    debounceRefresh();
  });

  // 在 document 上监听 dragover 事件，处理 header 阻挡的情况
  document.addEventListener('dragover', function (e) {
    autoScrollOnDrag(e);
  });

  // 实现自动滚动，并考虑 fixed header 的影响
  function autoScrollOnDrag(e) {
    const scrollMargin = 50; // 离页面顶部或底部多少像素时开始滚动
    const scrollSpeed = 10; // 每次滚动的像素数
    const clientY = e.clientY;
    const windowHeight = window.innerHeight;

    // 如果鼠标接近页面顶部，并考虑固定 header 的高度
    if (clientY < scrollMargin + headerHeight) {
      window.scrollBy(0, -scrollSpeed); // 向上滚动
    } else if (clientY > windowHeight - scrollMargin) {
      window.scrollBy(0, scrollSpeed); // 向下滚动
    }
  }
});

const themeSwitcher = document.getElementById('color_mode');
const bodyElement = document.body;

if (localStorage.getItem('theme') === 'dark') {
  themeSwitcher.checked = true;
  bodyElement.classList.add('dark-mode');
}

// 切換主題的函數
themeSwitcher.addEventListener('change', function () {
    if (themeSwitcher.checked) {
      localStorage.setItem('theme', 'dark');
      bodyElement.classList.add('dark-mode');
    } else {
      localStorage.removeItem('theme');
      bodyElement.classList.remove('dark-mode');
    }
});

// 定義 debounce 函數
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
