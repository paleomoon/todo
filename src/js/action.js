/**
 *
 * 交互控制模块
 *
 * @file action.js
 * @author paleomoon
 *
 */

define(['Util', 'Data'], function (Util, Data) {

    var curCateId = -1; //当前主分类id，点击所有分类或子分类时为-1
    var curChildCateId = -1; //当前子分类id，点击所有分类或主分类时为-1
    var curTaskId = 0; //当前任务id
    /**
     * 点击分类列表
     * @param {Element} element 点击的DOM分类项元素
     */
    var clickCate = function (element) {
        //点击样式
        var items = Util.$('.task-category').getElementsByClassName('click-task-item');
        for (var i = 0, len = items.length; i < len; i++) {
            Util.removeClass(items[i], 'cate-active');
        }
        Util.addClass(element, 'cate-active');

        var tempId;
        if ((tempId = element.getAttribute('Data-cate-id')) != null) {
            curCateId = tempId;
            curChildCateId = -1;
        }
        else if ((tempId = element.getAttribute('Data-child-cate-id')) != null) {
            curCateId = -1;
            curChildCateId = tempId;
        }
        else if (element.classList.contains('all-task-title')) {
            curCateId = -1;
            curChildCateId = -1;
        }
        var taskArr = getTaskByActivedCate();
        updateTaskList(taskArr); //更新任务列表

        //Util.$('#all-task-btn').click();
        setClickedBtnStyle(Util.$("#all-task-btn")); //设置任务状态为点击所有按钮

        if (taskArr.length) {
            updateTaskDetail(taskArr[0]); //更新任务详情
        }

        console.log("********************");
        console.log(curCateId);
        console.log(curChildCateId);
        console.log(curTaskId);
        console.log("********************");
    };

    /**
     * 根据点击的分类元素获取任务
     * @return {Array} 任务对象数组
     */
    var getTaskByActivedCate = function () {
        var taskArr = [];
        if (curCateId != -1) {
            taskArr = Data.getTaskByCateId(curCateId);
        }
        else if (curChildCateId != -1) {
            taskArr = Data.getTaskByChildCateId(curChildCateId);
        }
        else {
            taskArr = Data.getAllTask();
        }
        return taskArr;
    };

    /**
     * 更新分类列表
     */
    var updateCateList = function () {
        var cate = JSON.parse(localStorage.getItem('cate'));
        var childCate = JSON.parse(localStorage.getItem('childCate'));
        var task = JSON.parse(localStorage.getItem('task'));

        var html = '';
        for (var i = 0; i < cate.length; i++) {
            html += '<li>' +
                    '<h3 class="click-task-item" Data-cate-id=' + cate[i].id + '><i class="fa fa-folder-open"></i>' + cate[i].name + ' (<span>' + Data.getCateTaskNum(cate[i]) + '</span>)';
            if (i !== 0) { //默认主分类
                html += '<div class="delete-category"><i class="fa fa-trash"></i></div>';
            }
            html += '</h3>' +
                '<ul>';
            for (var j = 0; j < cate[i].child.length; j++) {
                var child = Data.getChildCateById(cate[i].child[j]);
                html += '<li><h4 class="click-task-item" Data-child-cate-id=' + child.id + '><i class="fa fa-file-o"></i>' + child.name + ' (<span>' + Data.getChildCateTaskNum(child) + '</span>)';
                if (i !== 0 || j !== 0) { //默认子分类
                    html += '<div class="delete-category"><i class="fa fa-trash"></i></div>';
                }
                html += '</h4></li>'
            }
            html += '</ul>' +
                '</li>';
        }
        Util.$('#main-category-list').innerHTML = html;

        //更新所有任务数量
        Util.$('.all-task-title span').innerText = Data.getAllTask().length;
    };

    /**
     * 初始化模态框
     */
    var initModal = function () {
        var cate = JSON.parse(localStorage.getItem('cate'));
        var select = Util.$('#new-category-select');
        var html = '<option value="0">新增主分类</option>';
        for (var i = 1; i < cate.length; i++) {
            html += '<option value=' + cate[i].id + '>' + cate[i].name + '</option>';
        }
        select.innerHTML = html;
    };

    /**
     * 绑定添加分类相关事件
     */
    var bindAddCateEvent = function () {
        Util.addClickEvent(Util.$('#add-category'), function () {
            initModal();
            Util.$('#mask').style.display = "block";
        });

        Util.addClickEvent(Util.$('#modal-confirm'), function () {
            var cate = Data.getCate();
            var select =Util.$('#new-category-select');
            var value = select.value;
            var name = Util.$('#new-category-name').value;
            if (name === "") {
                alert("请输入分类名称");
                return;
            }
            if (value == 0) { //默认主分类
                var newCate = {};
                newCate.id = cate[cate.length-1].id + 1; //在最后一个id上加1
                newCate.name = name;
                newCate.child = [];
                cate.push(newCate);
                localStorage.setItem('cate', JSON.stringify(cate));

                Util.$('#main-category-list').innerHTML += '<li>' +
                    '<h3 class="click-task-item main-category" Data-cate-id=' + newCate.id + '><i class="fa fa-folder-open"></i>' + newCate.name +
                    ' (<span>0</span>)<div class="delete-category"><i class="fa fa-trash"></i></div></h3>' +
                    '</li>';

                clickCate(Util.$('[Data-cate-id=' + newCate.id + ']')); //跳转到新建分类
            }
            else {
                var childCate = Data.getChildCate();
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

                        updateCateList();

                        clickCate(Util.$('[Data-child-cate-id=' + newChildCate.id + ']')); //跳转到新建分类
                    }
                }
            }
            Util.$('#mask').style.display = "none";
        });
        Util.addClickEvent(Util.$('#modal-cancel'), function () {
            Util.$('#mask').style.display = "none";
        });
    };

    /**
     * 删除分类
     * @param {object} element 点击的元素
     * @param {object} event 事件对象
     */
    var deleteCateItem = function (element, event) {
        var e = Util.getEvent(event);
        Util.stopPropagation(event); //阻止事件冒泡，否则无法准确找到分类元素
        var cateElement = element.parentNode.parentNode; //找到分类元素
        var id;
        if ((id = cateElement.getAttribute('Data-cate-id')) != null) { //主分类
            Data.deleteCate(id);
        }
        else if ((id = cateElement.getAttribute('Data-child-cate-id')) != null) { //子分类
            Data.deleteChildCate(id);
        }
        updateCateList();
        updateTaskList(Data.getAllTask());
        clickCate(Util.$('.all-task-title')); //默认显示所有分类
    };

    /**
     * 创建任务列表
     * @param {Array} task 任务对象数组
     */
    var updateTaskList = function (task) {
        var taskArr = Data.sortTaskArrByDate(task); //排序
        var dateTaskGroupArr = Data.getDateTaskGroup(taskArr); //分组
        var html = '';
        for (var i = 0; i < dateTaskGroupArr.length; i++) {
            html += '<li><div class="date">' + dateTaskGroupArr[i].date + '</div>' +
                        '<ul>';
            for (var j = 0; j < dateTaskGroupArr[i].task.length; j++) {
                if (dateTaskGroupArr[i].task[j].finish) {
                    html += '<li class="task-done task" Data-task-id=' + dateTaskGroupArr[i].task[j].id + '><i class="fa fa-check"></i>' + dateTaskGroupArr[i].task[j].title + '<div class="delete-task"><i class="fa fa-trash"></i></div></li>';
                }
                else {
                    html += '<li class="task-undone task" Data-task-id=' + dateTaskGroupArr[i].task[j].id + '>' + dateTaskGroupArr[i].task[j].title + '<div class="delete-task"><i class="fa fa-trash"></i></div></li>';
                }
            }
            html += '</ul>' +
                '</li>';
        }
        Util.$('#task-list').innerHTML = html;
    };

    /**
     * 设置点击按钮样式
     */
    var setClickedBtnStyle = function (element) {
        Util.addClass(element, 'btn-clicked');
        var sib = Util.siblings(element);
        for (var i = 0; i < sib.length; i++) {
            Util.removeClass(sib[i], 'btn-clicked');
        }
    };

    /**
     * 绑定任务状态筛选事件
     */
    var bindTaskStatusEvent = function () {
        Util.addClickEvent(Util.$('#all-task-btn'), function () {
            var taskArr = getTaskByActivedCate();
            updateTaskList(Data.getTaskByStatus(taskArr));
            setClickedBtnStyle(this);
        });

        Util.addClickEvent(Util.$('#done-task-btn'), function () {
            var taskArr = getTaskByActivedCate();
            updateTaskList(Data.getTaskByStatus(taskArr, true));
            setClickedBtnStyle(this);
        });

        Util.addClickEvent(Util.$('#undone-task-btn'), function () {
            var taskArr = getTaskByActivedCate();
            updateTaskList(Data.getTaskByStatus(taskArr, false));
            setClickedBtnStyle(this);
        });
    };

    /**
     * 更新任务详情
     * @param {object} task 任务对象
     */
    var updateTaskDetail = function (task) {
        var tempStr = ''; //完成和修改按钮
        if (!task.finish) {
            tempStr = '<div class="edit-btn"><i class="fa fa-edit"></i></div><div class="check-btn"><i class="fa fa-check-square-o"></i></div>';
        }
        var html = '<div class="task-title">' + task.title + tempStr + '</div>' +
                '<div class="task-date">任务日期：' + task.date + '</div>' +
                '<div class="task-content">' + task.content + '</div>';
        Util.$('.task-detail').innerHTML = html;
    };

    /**
     * 点击任务
     * @param {object} element 点击的任务对应dom元素
     */
    var clickTask = function (element) {
        var id = element.getAttribute("Data-task-id");
        var task = Data.getTaskById(id);
        updateTaskDetail (task);
        curTaskId = id;

        //设置样式
        var items = Util.$('.task-list').getElementsByClassName('task');
        for (var i = 0, len = items.length; i < len; i++) {
            Util.removeClass(items[i], 'task-active');
        }
        Util.addClass(element, 'task-active');
    };

    /**
     * 删除任务
     * @param {object} element 点击的元素
     * @param {object} event 事件对象
     */
    var deleteTaskItem = function (element, event) {
        if (confirm("确定删除任务？")) {
            var e = Util.getEvent(event);
            Util.stopPropagation(event); //阻止事件冒泡，否则无法准确找到任务元素
            var taskElement = element.parentNode.parentNode; //找到分类元素
            var id = taskElement.getAttribute('Data-task-id');
            var task = Data.getTaskById(id);
            Data.deleteTaskById(id);
            updateChildCateChild("delete", task.pid, id);
            updateCateList();
            updateTaskList(Data.getAllTask());
            clickCate(Util.$('.all-task-title')); //默认显示所有分类
            //updateTaskDetail();
        }
    }

    /**
     * 设置编辑状态
     * @param {number} state 编辑状态 0-新建任务的编辑状态 1-修改任务的编辑状态
     * @param {string} title [可选] 任务标题
     * @param {string} date [可选] 任务时间
     * @param {string} content [可选] 任务内容
     */
    var setEditState = function (state, title, date, content) {
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
        Util.$('.task-detail').innerHTML = html;
    };

    /**
     * 绑定编辑相关事件
     * @param {number} state 编辑状态 0-新建任务的编辑状态 1-修改任务的编辑状态
     */
    var bindEditEvent = function (state) {
        Util.addClickEvent(Util.$('#save-task-btn'), function () {
            var title = Util.$('.task-title input').value;
            var date = Util.$('.task-date input').value;
            var content = Util.$('.task-content textarea').value;
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

            var taskArr = Data.getAllTask();
            if (state === 0) {
                var newTask ={};
                newTask.title = title;
                newTask.date = date;
                newTask.content = content;
                newTask.finish = false;

                //添加id
                newTask.id = taskArr[taskArr.length - 1].id + 1;

                //添加pid
                if (curCateId != -1) {
                    var childCateId = Data.getCateById(curCateId).child[0];
                    newTask.pid = childCateId; //如果点击的是主分类，则任务pid为其第一个子分类id
                }
                else if (curChildCateId != -1) {
                    newTask.pid = curChildCateId; //如果点击的是子分类，则任务pid为该子分类id
                }
                else {
                    newTask.pid = 0;
                }
                updateChildCateChild("add", newTask.pid, newTask.id); //更新子分类child
                Data.addTask(newTask);
                updateTaskList(getTaskByActivedCate());
                updateCateList();
                updateTaskDetail (newTask);

                clickTask(Util.$('[Data-task-id=' + newTask.id + ']')); //跳转到新任务
            }
            else if (state === 1) {
                updateTask(title, date, content);
            }
        });

        Util.addClickEvent(Util.$('#quit-task-btn'), function () { 
            updateTaskDetail (Data.getTaskById(curTaskId));
        });
    };

    /**
     * 绑定新建任务相关事件
     */
    var bindAddTaskEvent = function () {
        Util.addClickEvent(Util.$('.add-task'), function () {
            if (curCateId != -1) {
                var childCate = Data.getCateById(curCateId).child[0];
                if (childCate == null) {
                    alert('请先添加子分类');
                    return;
                }
            }
            setEditState(0);
            bindEditEvent(0);
        });
    };

    /**
     * 更新子分类child
     * @param {string} updateMode 更新模式 add-添加 delete-删除
     * @param {number} childCateId 子分类id
     * @param {number} taskId 任务id
     */
    var updateChildCateChild = function (updateMode, childCateId, taskId) {
        var childCateArr = Data.getChildCate();
        for (var i = 0; i < childCateArr.length; i++) {
            if (childCateArr[i].id == childCateId) {
                if (updateMode == "add")
                    childCateArr[i].child.push(taskId); //添加
                else if (updateMode == "delete")
                    Util.removeByValue(childCateArr[i].child, taskId); //删除
                break;
            }
        }
        localStorage.setItem('childCate', JSON.stringify(childCateArr));
    };

    /**
     * 将任务标记为已完成
     */
    var finishTask = function () {
        var r = confirm("确定将任务标记为已完成吗？");
        if (r) {
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
            updateTaskList(getTaskByActivedCate());
            updateTaskDetail(curTask);
        }
    };

    /**
     * 点击更新任务详情按钮
     * @param {string} title 任务标题
     * @param {string} date 任务日期
     * @param {string} content 任务内容
     */
    var updateTask = function (title, date, content) {
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
        updateTaskList(getTaskByActivedCate());
        updateTaskDetail(curTask);
    };

    /**
     * 点击编辑任务详情按钮
     */
    var editTask = function () {
        var task = Data.getTaskById(curTaskId);
        setEditState(1, task.title, task.date, task.content);
        bindEditEvent(1);
    };

    /**
     * 初始化
     */
    var init = function () {
        //localStorage.clear();
        Data.initData();
        updateCateList();
        updateTaskList(Data.getAllTask());

        //所有分类
        Util.addClickEvent(Util.$('.all-task-title'), function () {
            clickCate(this);
        });
        //分类列表
        var cateList = Util.$('#main-category-list');
        Util.delegateEventByTagName(cateList, 'h3', 'click', function () {
            clickCate(this);
        });
        Util.delegateEventByTagName(cateList, 'h4', 'click', function () {
            clickCate(this);
        });
        //删除分类
        Util.delegateEventByClassName(cateList, 'fa-trash', 'click', function () {
            deleteCateItem(this, event);
        });

        //任务列表
        var taskList = Util.$('#task-list');
        Util.delegateEventByClassName(taskList, 'task', 'click', function () {
            clickTask(this);
        });
        //删除任务
        Util.delegateEventByClassName(taskList, 'fa-trash', 'click', function () {
            deleteTaskItem(this, event);
        });

        //任务详情
        var taskDetail = Util.$('.task-detail')
        Util.delegateEventByClassName(taskDetail, 'fa-edit', 'click', function () {
            editTask();
        });
        Util.delegateEventByClassName(taskDetail, 'fa-check-square-o', 'click', function () {
            finishTask();
        });

        bindTaskStatusEvent();
        bindAddCateEvent();
        bindAddTaskEvent();
        clickCate(Util.$('.all-task-title')); //默认显示所有分类
    };

    return {
        init: init
    };
});


