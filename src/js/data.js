/**
 *
 * 数据处理模块
 *
 * @file data.js
 * @author paleomoon
 *
 */

/**
 *
 * 使用数据库的思想，构建3张表。
 *
 * 分类表 cate
 * ----------------------
 * id* | name | child
 * ----------------------
 *
 * 子分类表 childCate
 * --------------------------------
 * id* | pid | name | child
 * --------------------------------
 *
 * 任务表 task
 * ----------------------------------------------
 * id* | pid | finish | title | date | content
 * ----------------------------------------------
 */
define(['Util'], function (Util) {

    /**
     * 初始化本地数据
     */
    var initData = function () {
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
    };

    /**
     * 获取指定子分类下的任务数量
     * @{param} childCate 子分类对象
     * @{return} 子分类下的任务数
     */
    var getChildCateTaskNum = function (childCate) {
        return childCate.child.length;
     };

    /**
     * 获取指定主分类下的任务数量
     * @{param} cate 主分类对象
     * @{return} 主分类下的任务数
     */
    var getCateTaskNum = function (cate) {
        var num = 0;
        for (var i = 0; i < cate.child.length; i++) {
            num += getChildCateTaskNum(getChildCateById(cate.child[i]));
        }
        return num;
    };

    /**
     * 获取所有主分类
     * @{return} 主分类对象数组
     */
    var getCate = function () {
        return(JSON.parse(localStorage.getItem('cate')));
    };

    /**
     * 获取所有子分类
     * @{return} 子分类对象数组
     */
    var getChildCate = function () {
        return (JSON.parse(localStorage.getItem('childCate')));
    };

    /**
     * 根据任务id删除任务
     * @{param} id 任务id
     */
    var deleteTaskById = function (id) {
        var taskArr = JSON.parse(localStorage.getItem('task'));
        for (var i = 0; i < taskArr.length; i++) {
            if (taskArr[i].id == id) {
                taskArr.splice(i, 1);
                break;
            }
        }
        localStorage.setItem('task', JSON.stringify(taskArr));
    };

    /**
     * 删除子分类下的所有任务
     * @{param} childCate 子分类对象
     */
    var deleteTaskByChildCate = function (childCate) {
        for (var i = 0; i < childCate.child.length; i++) {
            deleteTaskById(childCate.child[i]);
        }
    };

    /**
     * 删除子分类
     * @param {number} id 子分类id
     * @return {Array} 子分类对象数组
     */
    var deleteChildCate = function (id) {
        var childCateArr = getChildCate();
        var pid;
        for (var i = 0; i < childCateArr.length; i++) {
            if (childCateArr[i].id == id) {
                pid = childCateArr[i].pid;
                deleteTaskByChildCate( childCateArr[i]); //删除子分类任务
                childCateArr.splice(i, 1); //删除子分类
                break;
            }
        }
        localStorage.setItem('childCate', JSON.stringify(childCateArr));

        //更新主分类child
        var cateArr = getCate();
        for (var i = 0; i < cateArr.length; i++) {
            if (cateArr[i].id == pid) {
                Util.removeByValue(cateArr[i].child, id);
            }
        }
        localStorage.setItem('cate', JSON.stringify(cateArr));
    };

    /**
     * 删除主分类
     * @param {number} id 主分类id
     * @return {Array} 主分类对象数组
     */
    var deleteCate = function (id) {
        var cateArr = getCate();
        for (var i = 0; i < cateArr.length; i++) {
            if (cateArr[i].id == id) {
                for (var j = 0; j < cateArr[i].child.length; j++) {
                    deleteChildCate(cateArr[i].child[j]); //删除子分类
                }
                cateArr.splice(i, 1);
                break;
            }
        }
        localStorage.setItem('cate', JSON.stringify(cateArr));
    };

    /**
     * 根据任务完成状态筛选任务
     * @param {Array} taskArr 任务对象数组
     * @param {boolean} status [可选] 任务完成状态，完成-true，未完成-false
     * @return {Array} 任务对象数组
     */
    var getTaskByStatus = function (taskArr, status) {
        var result = [];
        if (status !== undefined) { //没有此参数
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
    };

    /**
     * 获取所有任务
     * @return {Array} 任务对象数组
     */
    var getAllTask = function () {
        var task = JSON.parse(localStorage.getItem('task'));
        return getTaskByStatus(task);
    };

    /**
     * 根据任务id获取任务
     * @param {number} 任务id
     * @return {Array} 任务对象
     */
    var getTaskById = function (id) {
        var taskArr = JSON.parse(localStorage.getItem('task'));
        for (var i = 0; i < taskArr.length; i++) {
            if (taskArr[i].id == id) {
                return taskArr[i];
            }
        }
    };

    /**
     * 根据子分类id获取任务
     * @param {number} 子分类id
     * @return {Array} 任务对象数组
     */
    var getTaskByChildCateId = function (id) {
        var childCate = getChildCateById(id);
        var result = [];
        for (var i = 0; i < childCate.child.length; i++) {
            result.push(getTaskById(childCate.child[i]));
        }
        return result;
    };

    /**
     * 根据主分类id获取任务
     * @param {number} 主分类id
     * @return {Array} 任务对象数组
     */
    var getTaskByCateId = function (id) {
        var cate = getCateById(id);
        var result = [];
        for (var i = 0; i < cate.child.length; i++) {
            var temp = getTaskByChildCateId(cate.child[i]);
            for (var j = 0; j < temp.length; j++) {
                result.push(temp[j]);
            }
        }
        return result;
    };

    /**
     * 根据子分类id查询子分类
     * @param {number} id 子分类id
     * @return {object} 子分类对象
     */
    var getChildCateById = function (id) {
        var childCate = JSON.parse(localStorage.getItem('childCate'));
        for (var i = 0; i < childCate.length; i++) {
            if (childCate[i].id == id) {
                return childCate[i];
            }
        }
    };

    /**
     * 根据主分类id查询主分类
     * @param {number} id 主分类id
     * @return {object} 主分类对象
     */
    var getCateById = function (id) {
        var cate = JSON.parse(localStorage.getItem('cate'));
        for (var i = 0; i < cate.length; i++) {
            if (cate[i].id == id) {
                return cate[i];
            }
        }
    };

    /**
     * 对任务数组按日期进行排序
     * @param {Array} taskArr 任务数组
     * @return {Array} 排序后的任务数组
     */
    var sortTaskArrByDate = function (taskArr) {
        return taskArr.sort(function (val1, val2) {
            //可以直接比较大小，即比较字符串对应的编码
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
    };

    /**
     * 获取每个日期下的所有任务，并组合
     * @param {Array} taskArr 排序后的任务数组
     * @return {Array} 日期任务组合对象数组
     */
    var getDateTaskGroup = function (sortedTaskArr) {
        var dateTaskGroupArr = [];
        var temp = {};
        temp.date = '';
        temp.task = [];
        for (var i = 0, len = sortedTaskArr.length; i < len; i++) {
            temp.date = sortedTaskArr[i].date;
            temp.task.push(sortedTaskArr[i]);
            //当前日期不等于下一个日期，则一个日期分组结束
            if ((i != len - 1 && sortedTaskArr[i].date != sortedTaskArr[i + 1].date) || i == len - 1) {
                dateTaskGroupArr.push(Util.deepClone(temp)); //深克隆临时对象
                //清空临时对象
                temp.date = '';
                temp.task = [];
            }
        }
        return dateTaskGroupArr;
    };

    /**
     * 添加任务
     * @param {object} newTask 新任务对象
     */
    var addTask = function (newTask) {
        var taskArr = getAllTask();
        taskArr.push(newTask);
        localStorage.setItem('task', JSON.stringify(taskArr));
        //return taskArr;
    };

    return {
        initData: initData,

        getChildCateTaskNum: getChildCateTaskNum,
        getCateTaskNum: getCateTaskNum,
        getChildCate: getChildCate,
        getCate: getCate,
        getChildCateById: getChildCateById,
        getCateById: getCateById,
        getAllTask: getAllTask,
        getTaskById: getTaskById,
        getTaskByChildCateId: getTaskByChildCateId,
        getTaskByCateId: getTaskByCateId,
        getTaskByStatus: getTaskByStatus,
        getDateTaskGroup: getDateTaskGroup,

        deleteTaskById: deleteTaskById,
        deleteTaskByChildCate: deleteTaskByChildCate,
        deleteChildCate: deleteChildCate,
        deleteCate: deleteCate,
        
        sortTaskArrByDate: sortTaskArrByDate,
        addTask: addTask
    };
});


