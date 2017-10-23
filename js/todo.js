
var curCateId = -1;
var curChildCateId = -1;
var curTaskId = 0;

function initData () {
    if (!localStorage.getItem('cate') || !localStorage.getItem('childCate') || !localStorage.getItem('task')) {
        var cateJson = [{
            "id": 0,
            "name": "默认分类",
            "child": [0] //从表ID
        }, {
            "id": 1,
            "name": "工作",
            "child": [1, 2]
        }];

        var cateChildJson = [{
            "id": 0,
            "pid": 0, //主表ID
            "name": "默认子分类",
            "child": [0, 1, 4]
        }, {
            "id": 1,
            "pid": 1,
            "name": "工作1",
            "child": [2]
        }, {
            "id": 2,
            "pid": 1,
            "name": "工作2",
            "child": [3]
        }];

        var taskJson = [{
            "id": 0,
            "pid": 0,
            "finish": true,
            "title": "默认1",
            "date": "2017-09-17",
            "content": "默认内容1"
        }, {
            "id": 1,
            "pid": 0,
            "finish": false,
            "title": "默认2",
            "date": "2017-09-18",
            "content": "默认内容2"
        }, {
            "id": 2,
            "pid": 1,
            "finish": false,
            "title": "task1",
            "date": "2017-09-18",
            "content": "内容"
        }, {
            "id": 3,
            "pid": 2,
            "finish": true,
            "title": "task2",
            "date": "2017-09-18",
            "content": "内容"
        }, {
            "id": 4,
            "pid": 0,
            "finish": false,
            "title": "默认3",
            "date": "2017-09-17",
            "content": "默认内容3"
        }];
        localStorage.setItem('cate', JSON.stringify(cateJson));
        localStorage.setItem('childCate', JSON.stringify(cateChildJson));
        localStorage.setItem('task', JSON.stringify(taskJson));
    }
}

function clickCate (element) {
    var items = $('.task-category').getElementsByClassName('click-task-item');
    for (var i = 0, len = items.length; i < len; i++) {
        removeClass(items[i], 'cate-active');
    }
    addClass(element, 'cate-active');

    var tempId;
    if ((tempId = element.getAttribute('data-cate-id')) != null) {
        curCateId = tempId;
        curChildCateId = -1;
    }
    else if ((tempId = element.getAttribute('data-child-cate-id')) != null) {
        curCateId = -1;
        curChildCateId = tempId;
    }
    else if (element.classList.contains('all-task-title')) {
        curCateId = -1;
        curChildCateId = -1;
    }
    var taskArr = getTaskByActivedCate();
    refreshTaskListHtml(taskArr);

    $('#all-task-btn').click();
    if (taskArr.length) {
        refreshTaskDetail(taskArr[0]);
    }
}
/**
 *
 */
function getChildCateTaskNum (childCate) {
    var num = 0;
    for (var i = 0; i < childCate.child.length; i++) {
        num++;
    }
    return num;
 }

function getCateTaskNum (cate) {
    var num = 0;
    for (var i = 0; i < cate.child.length; i++) {
        num += getChildCateTaskNum(getChildCateById(cate.child[i]));
    }
    return num;
}

function getCate () {
    return(JSON.parse(localStorage.getItem('cate')));
}

function getChildCate () {
    return (JSON.parse(localStorage.getItem('childCate')));
}

function deleteTaskById (id) {
    var taskArr = JSON.parse(localStorage.getItem('task'));
    for (var i = 0; i < taskArr.length; i++) {
        if (taskArr[i].id == id) {
            taskArr.splice(i, 1);
            break;
        }
    }
    localStorage.setItem('task', JSON.stringify(taskArr));
}

function deleteTaskByChildCate (childCate) {
    for (var i = 0; i < childCate.child.length; i++) {
        deleteTaskById(childCate.child[i]);
    }
}

/**
 * 删除子分类
 * @param {number} id 子分类id
 * @return {Array} 子分类对象数组
 */
function deleteChildCate (id) {
    var childCateArr = getChildCate();
    var pid;
    for (var i = 0; i < childCateArr.length; i++) {
        if (childCateArr[i].id == id) {
            pid = childCateArr[i].pid;
            deleteTaskByChildCate( childCateArr[i]);
            childCateArr.splice(i, 1); //删除子分类
            break;
        }
    }
    localStorage.setItem('childCate', JSON.stringify(childCateArr));

    //更新主分类child
    var cateArr = getCate();
    for (var i = 0; i < cateArr.length; i++) {
        if (cateArr[i].id == pid) {
            removeByValue(cateArr[i].child, id);
        }
    }
    localStorage.setItem('cate', JSON.stringify(cateArr));
}

/**
 * 删除主分类
 * @param {number} id 主分类id
 * @return {Array} 主分类对象数组
 */
function deleteCate (id) {
    var cateArr = getCate();
    for (var i = 0; i < cateArr.length; i++) {
        if (cateArr[i].id == id) {
            for (var j = 0; j < cateArr[i].child.length; j++) {
                deleteChildCate(cateArr[i].child[j]);
            }
            cateArr.splice(i, 1);
            break;
        }
    }
    localStorage.setItem('cate', JSON.stringify(cateArr));
}

/**
 * 根据任务完成状态查询任务
 * @param {Array} taskArr 任务对象数组
 * @param {boolean} status 任务完成状态
 * @return {Array} 任务对象数组
 */
function getTaskByStatus (taskArr, status) {
    var result = [];
    if (status !== undefined) {
        for (var i = 0; i < taskArr.length; i++) {
            if (status) {
                if (taskArr[i].finish) {
                    result.push(taskArr[i]);
                }
            }
            else {
                if (!taskArr[i].finish) {
                    result.push(taskArr[i]);
                }
            }
        }
        return result;
    }
    else {
        return taskArr;
    }
}

function getAllTask () {
    var task = JSON.parse(localStorage.getItem('task'));
    return getTaskByStatus(task);
}

function getTaskById (id) {
    var taskArr = JSON.parse(localStorage.getItem('task'));
    for (var i = 0; i < taskArr.length; i++) {
        if (taskArr[i].id == id) {
            return taskArr[i];
        }
    }
}

function getTaskByChildCateId (id) {
    var childCate = getChildCateById(id);
    var result = [];
    for (var i = 0; i < childCate.child.length; i++) {
        result.push(getTaskById(childCate.child[i]));
    }
    return result;
}

function getTaskByCateId (id) {
    var cate = getCateById(id);
    var result = [];
    for (var i = 0; i < cate.child.length; i++) {
        var temp = getTaskByChildCateId(cate.child[i]);
        for (var j = 0; j < temp.length; j++) {
            result.push(temp[j]);
        }
    }
    return result;
}

/**
 * 根据点击的分类元素获取任务
 * @param {object} element 点击的分类元素
 * @return {Array} 任务对象数组
 */
function getTaskByActivedCate () {
    var taskArr = [];
    if (curCateId != -1) {
        taskArr = getTaskByCateId(curCateId);
    }
    else if (curChildCateId != -1) {
        taskArr = getTaskByChildCateId(curChildCateId);
    }
    else {
        taskArr = getAllTask();
    }
    return taskArr;
}

/**
 * 根据子分类id查询子分类
 * @param {number} id 子分类id
 * @return {object} 子分类对象
 */
function getChildCateById (id) {
    var childCate = JSON.parse(localStorage.getItem('childCate'));
    for (var i = 0; i < childCate.length; i++) {
        if (childCate[i].id == id) {
            return childCate[i];
        }
    }
}

function getCateById (id) {
    var cate = JSON.parse(localStorage.getItem('cate'));
    for (var i = 0; i < cate.length; i++) {
        if (cate[i].id == id) {
            return cate[i];
        }
    }
}


function initCateHtml () {
    var cate = JSON.parse(localStorage.getItem('cate'));
    var childCate = JSON.parse(localStorage.getItem('childCate'));
    var task = JSON.parse(localStorage.getItem('task'));

    var ul = document.getElementById('main-category-list');
    var html = '';
    for (var i = 0; i < cate.length; i++) {
        html += '<li>' +
                '<h3 class="click-task-item" data-cate-id=' + cate[i].id + ' onclick="clickCate(this)"><i class="fa fa-folder-open"></i>' + cate[i].name + ' (<span>' + getCateTaskNum(cate[i]) + '</span>)';
        if (i !== 0) {
            html += '<div class="delete-category"><i class="fa fa-trash" onclick="deleteItem(this, event)"></i></div>';
        }
        html += '</h3>' +
            '<ul>';
        for (var j = 0; j < cate[i].child.length; j++) {
            var child = getChildCateById(cate[i].child[j]);
            html += '<li><h4 class="click-task-item" data-child-cate-id=' + child.id + ' onclick="clickCate(this)"><i class="fa fa-file-o"></i>' + child.name + ' (<span>' + getChildCateTaskNum(child) + '</span>)';
            if (i !== 0 || j !== 0) {
                html += '<div class="delete-category"><i class="fa fa-trash" onclick="deleteItem(this, event)"></i></div>';
            }
            html += '</h4></li>'
        }
        html += '</ul>' +
            '</li>';
    }
    ul.innerHTML = html;

    //所有任务数量
    $('.all-task-title span').innerText = getAllTask().length;
}

/**
 * 初始化模态框
 */
function initModal () {
    var cate = JSON.parse(localStorage.getItem('cate'));
    var select = $('#new-category-select');
    var html = '<option value="0">新增主分类</option>';
    for (var i = 1; i < cate.length; i++) {
        html += '<option value=' + cate[i].id + '>' + cate[i].name + '</option>';
    }
    select.innerHTML = html;
}

function bindAddCateEvent () {
    addClickEvent($('#add-category'), function () {
        initModal();
        $('#mask').style.display = "block";
    });

    addClickEvent($('#modal-confirm'), function () {
        var cate = getCate();
        var select =$('#new-category-select');
        var value = select.value;
        var name = $('#new-category-name').value;
        if (value == 0) { //默认主分类
            var newCate = {};
            newCate.id = cate[cate.length-1].id + 1; //在最后一个id上加1
            newCate.name = name;
            newCate.child = [];
            cate.push(newCate);
            localStorage.setItem('cate', JSON.stringify(cate));

            var ul = document.getElementById('main-category-list');
            ul.innerHTML += '<li>' +
                '<h3 class="click-task-item main-category" data-cate-id=' + newCate.id + ' onclick="clickCate(this)"><i class="fa fa-folder-open"></i>' + newCate.name +
                ' (<span>0</span>)<div class="delete-category"><i class="fa fa-trash" onclick="deleteItem(this, event)"></i></div></h3>' +
                '</li>';

            clickCate($('[data-cate-id=' + newCate.id + ']'));
        }
        else {
            var childCate = getChildCate();
            for (var i = 1, len = cate.length; i < len; i++) {
                if (value == cate[i].id) {
                    //添加子分类
                    var newChildCate = {};
                    newChildCate.id = childCate[childCate.length - 1].id + 1;
                    newChildCate.pid = cate[i].id;
                    newChildCate.name = name;
                    newChildCate.child = [];
                    childCate.push(newChildCate);
                    localStorage.setItem('childCate', JSON.stringify(childCate));

                    //更新主分类child
                    cate[i].child.push(newChildCate.id);
                    localStorage.setItem('cate', JSON.stringify(cate));

                    // var cateElement = $('[data-cate-id=' + cate[i].id + ']'); //根据date-cate-id属性查找对应主分类元素
                    // var childCateUlElement = cateElement.nextElementSibling;
                    // if (childCateUlElement) {
                    //     childCateUlElement.innerHTML += '<li><h4 class="click-task-item" data-child-cate-id=' + newChildCate.id + ' onclick="clickCate(this)"><i class="fa fa-file-o"></i>' + newChildCate.name +
                    //         ' (<span>0</span>)<div class="delete-category"><i class="fa fa-trash" onclick="deleteItem(this, event)"></i></div></h4></li>';
                    // }
                    // else {
                    //     cateElement.innerHTML += '<ul>' +
                    //         '<li><h4 class="click-task-item" data-child-cate-id=' + newChildCate.id + ' onclick="clickCate(this)"><i class="fa fa-file-o"></i>' + newChildCate.name +
                    //         ' (<span>0</span>)<div class="delete-category"><i class="fa fa-trash" onclick="deleteItem(this, event)"></i></div></h4></li>' +
                    //         '</ul>';
                    // }
                    initCateHtml();

                    clickCate($('[data-child-cate-id=' + newChildCate.id + ']'));
                }
            }
        }
        $('#mask').style.display = "none";
    });
    addClickEvent($('#modal-cancel'), function () {
        $('#mask').style.display = "none";
    });
}

function deleteItem(element, event) {
    var e = getEvent(event);
    stopPropagation(event); //阻止事件冒泡，否则无法准确找到分类元素
    var cateElement = element.parentNode.parentNode;
    var id;
    if ((id = cateElement.getAttribute('data-cate-id')) != null) {
        deleteCate(id);
    }
    else if ((id = cateElement.getAttribute('data-child-cate-id')) != null) {
        deleteChildCate(id);
    }
    initCateHtml();
    refreshTaskListHtml(getAllTask());
    clickCate($('.all-task-title')); //默认显示所有分类
}

/**
 * 对任务数组按日期进行排序
 * @param {Array} taskArr 任务数组
 * @return {Array} 排序后的任务数组
 */
function sortTaskArrByDate(taskArr) {
    return taskArr.sort(function (val1, val2) {
        //可以直接比较大小，即比较字符对应的编码
        if (val1.date < val2.date) {
            return -1;
        }
        else if (val1.date > val2.date) {
            return 1;
        }
        else {
            return 0;
        }
    });
}

/**
 * 获取每个日期下的所有任务，并组合
 * @param {Array} taskArr 排序后的任务数组
 * @return {Array} 日期任务组合数组
 */
function getDateTaskGroup(taskArr) {
    var dateTaskGroupArr = [];
    var temp = {};
    temp.date = '';
    temp.task = [];
    for (var i = 0, len = taskArr.length; i < len; i++) {
        temp.date = taskArr[i].date;
        temp.task.push(taskArr[i]);
        //当前日期不等于下一个日期，则一个日期分组结束
        if ((i != len - 1 && taskArr[i].date != taskArr[i + 1].date) || i == len - 1) {
            dateTaskGroupArr.push(deepClone(temp)); //深克隆临时对象
            //清空临时对象
            temp.date = '';
            temp.task = [];
        }
    }
    return dateTaskGroupArr;
}
/**
 * 创建任务列表
 * @param {Array} task 任务数组
 */
function refreshTaskListHtml(task) {
    var taskArr = sortTaskArrByDate(task);
    var dateTaskGroupArr = getDateTaskGroup(taskArr);
    var html = '';
    for (var i = 0; i < dateTaskGroupArr.length; i++) {
        html += '<li><div class="date">' + dateTaskGroupArr[i].date + '</div>' +
                    '<ul>';
        for (var j = 0; j < dateTaskGroupArr[i].task.length; j++) {
            if (dateTaskGroupArr[i].task[j].finish) {
                html += '<li class="task-done task" data-task-id="' + dateTaskGroupArr[i].task[j].id +'" onclick="clickTask(this)"><i class="fa fa-check"></i>' + dateTaskGroupArr[i].task[j].title + '</li>';
            }
            else {
                html += '<li class="task-undone task" data-task-id="' + dateTaskGroupArr[i].task[j].id +'" onclick="clickTask(this)">' + dateTaskGroupArr[i].task[j].title + '</li>';
            }
        }
        html += '</ul>' +
            '</li>';
    }
    $('#task-list').innerHTML = html;
}

function setClickedBtnStyle (element) {
    addClass(element, 'btn-clicked');
    var sib = siblings(element);
    for (var i = 0; i < sib.length; i++) {
        removeClass(sib[i], 'btn-clicked');
    }
}

function bindTaskStatusEvent () {
    addClickEvent($('#all-task-btn'), function () {
        var taskArr = getTaskByActivedCate();
        refreshTaskListHtml(getTaskByStatus(taskArr));
        setClickedBtnStyle(this);
    });

    addClickEvent($('#done-task-btn'), function () {
        var taskArr = getTaskByActivedCate();
        refreshTaskListHtml(getTaskByStatus(taskArr, true));
        setClickedBtnStyle(this);
    });

    addClickEvent($('#undone-task-btn'), function () {
        var taskArr = getTaskByActivedCate();
        refreshTaskListHtml(getTaskByStatus(taskArr, false));
        setClickedBtnStyle(this);
    });
}

function refreshTaskDetail (task) {
    //完成和修改按钮
    var tempStr = '';
    if (!task.finish) {
        tempStr = '<div class="edit-btn"><i class="fa fa-edit" onclick="editTask()"></i></div><div class="check-btn"><i class="fa fa-check-square-o"  onclick="finishTask()"></i></div>';
    }
    var html = '<div class="task-title">' + task.title + tempStr + '</div>' +
            '<div class="task-date">任务日期：' + task.date + '</div>' +
            '<div class="task-content">' + task.content + '</div>';
    $('.task-detail').innerHTML = html;
}

function clickTask (element) {
    var id = element.getAttribute("data-task-id");
    var task = getTaskById(id);
    refreshTaskDetail (task);
    curTaskId = id;

    var items = $('.task-list').getElementsByClassName('task');
    for (var i = 0, len = items.length; i < len; i++) {
        removeClass(items[i], 'task-active');
    }
    addClass(element, 'task-active');
}

function setEditState (state, title, date, content) {
    title = title || '';
    date = date || '';
    content = content || '';
    var btnText = '';
    if (state == 0) {
        btnText = '保存';
    }
    else if (state == 1) {
        btnText = '保存修改';
    }
    var html = '<div class="task-title"><input type="text" name="title" placeholder="请输入标题" value="' + title + '"/></div>' +
            '<div class="task-date">任务日期：<input type="date" name="date" value="' + date + '"/></div>' +
            '<div class="task-content"><textarea placeholder="请输入任务内容">' + content + '</textarea></div>' +
            '<div class="content-btn">' +
                '<input id="quit-task-btn" type="button" name="quit" value="放弃" />' +
                '<input id="save-task-btn" type="button" name="save" value="' + btnText + '" />' +
            '</div>';
    $('.task-detail').innerHTML = html;
}

function bindEditEvent (state) {
    addClickEvent($('#save-task-btn'), function () {
        var title = $('.task-title input').value;
        var date = $('.task-date input').value;
        var content = $('.task-content textarea').value;
        if (title == "") {
            alert('标题不能为空');
            return;
        }
        if (date == "") {
            alert('日期不能为空');
            return;
        }
        if (content == "") {
            alert('内容不能为空');
            return;
        }

        var taskArr = getAllTask();
        if (state === 0) {
            var newTask ={};
            newTask.title = title;
            newTask.date = date;
            newTask.content = content;
            newTask.finish = false;

            //添加id
            newTask.id = taskArr[taskArr.length - 1].id + 1;

            //添加pid
            var tempId;
            if (curCateId != -1) {
                var childCate = getCateById(curCateId).child[0];
                newTask.pid = childCate.id;
                tempId = childCate.id;
            }
            else if (curChildCateId != -1) {
                newTask.pid = curChildCateId;
                tempId = curChildCateId;
            }
            else {
                newTask.pid = 0;
                tempId = 0;
            }
            addChildTask(tempId, newTask.id);
            addTask(newTask);
            refreshTaskListHtml(getTaskByActivedCate());
            initCateHtml();
            refreshTaskDetail (newTask);

            clickTask($('[data-task-id=' + newTask.id + ']'));
        }
        else if (state === 1) {
            updateTask(title, date, content);
        }
            
    });

    addClickEvent($('#quit-task-btn'), function () { 
        refreshTaskDetail (getTaskById(curTaskId));
    });
}

function bindAddTaskEvent () {
    addClickEvent($('.add-task'), function () {
        if (curCateId != -1) {
            var childCate = getCateById(curCateId).child[0];
            if (childCate == null) {
                alert('请先添加子分类');
                return;
            }
        }
        setEditState(0);
        bindEditEvent(0);
    });
}

function addChildTask (childCateId, taskId) {
    var childCateArr = getChildCate();
    for (var i = 0; i < childCateArr.length; i++) {
        if (childCateArr[i].id == childCateId) {
            childCateArr[i].child.push(taskId);
            break;
        }
    }
    localStorage.setItem('childCate', JSON.stringify(childCateArr));
}

function addTask (newTask) {
    var taskArr = getAllTask();
    taskArr.push(newTask);
    localStorage.setItem('task', JSON.stringify(taskArr));
    //return taskArr;
}

function finishTask () {
    var curTask = {};
    var taskArr = JSON.parse(localStorage.getItem('task'));
    for (var i = 0; i < taskArr.length; i++) {
        if (taskArr[i].id == curTaskId) {
            taskArr[i].finish = true;
            curTask = taskArr[i];
            break;
        }
    }
    localStorage.setItem('task', JSON.stringify(taskArr));
    refreshTaskListHtml(getTaskByActivedCate());
    refreshTaskDetail(curTask);
}

function updateTask (title, date, content) {
    var curTask = {};
    var taskArr = JSON.parse(localStorage.getItem('task'));
    for (var i = 0; i < taskArr.length; i++) {
        if (taskArr[i].id == curTaskId) {
            taskArr[i].title = title;
            taskArr[i].date = date;
            taskArr[i].content = content;
            curTask = taskArr[i];
            break;
        }
    }
    localStorage.setItem('task', JSON.stringify(taskArr));
    refreshTaskListHtml(getTaskByActivedCate());
    refreshTaskDetail(curTask);
}

function editTask () {
    var task = getTaskById(curTaskId);
    setEditState(1, task.title, task.date, task.content);
    bindEditEvent(1);
}

function init () {
    localStorage.clear();
    initData();
    initCateHtml();
    refreshTaskListHtml(getAllTask());
    bindTaskStatusEvent();
    //initModal();
    bindAddCateEvent();
    bindAddTaskEvent();
    clickCate($('.all-task-title')); //默认显示所有分类
}
window.onload = function () {
    init();
};


