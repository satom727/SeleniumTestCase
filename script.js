$(function() {
    var saveFlg = false;
    saveFlg = true;//開発用に一時的にtrue
    var testCaseList = [];
    var tagList = [];
    //-------------------
    //オブジェクト定義
    //-------------------
    
    //コンストラクタ
    var TestSet = function(){
        this.pageTitle = '';
        this.pageUrl = '';
        this.TestSetName = '';
        this.TestSetNo = '';
        this.TestCaseList = [];
    };
    TestSet.prototype = {
        Convert2Json:function(){
            this.JsonStr = '{';
            this.JsonStr += 'pageTitle:' + this.pageTitle + ',';
            this.JsonStr += 'pageUrl:' + this.pageUrl + ',';
            this.JsonStr += 'TestSetName:' + this.TestSetName + ',';
            this.JsonStr += 'TestSetNo:' + this.TestSetNo + ',';
            this.JsonStr += 'TestCaseList:[';
            this.JsonStr += GetJsonStrList(this.TestCaseList);
            this.JsonStr += ']';
            this.JsonStr += '}';
        },
        GetJsonStr:function(){
            this.Convert2Json();
            return this.JsonStr;
        }
    };
    //コンストラクタ
    var TestCase = function(arr){
        this.TestCaseNo = 0;
        this.EndingSleepTime = 50;
        this.DomActList = arr;
        this.JsonStr;
    };
    TestCase.prototype = {
        Convert2Json:function(){
            this.JsonStr = '{';
            this.JsonStr += 'TestCaseNo:' + this.TestCaseNo + ',';
            this.JsonStr += 'EndingSleepTime:' + this.EndingSleepTime +',';
            this.JsonStr += 'DomActList:[';
            this.JsonStr += GetJsonStrList(this.DomActList);
            this.JsonStr += ']';
            this.JsonStr += '}';
        },
        GetJsonStr:function(){
            this.Convert2Json();
            return this.JsonStr;
        }
    };
    //コンストラクタ
    var TagDef = function(dom){
        this.selecterDefinition = '';
        this.selecterType = 'cssSelecter';
        this.targetDom = dom;
        this.tagDecidedFlg = false;
        this.errFlg = false;
        this.domActionType = '';
        this.value = '';
        this.jsonStr;
    };
    TagDef.prototype = {
        //domからid/class/tagnameのいずれかを取得する 
        GetDef:function(dom){
            var sel =  dom.attr('id');
            if(sel == null){
            sel =  dom.attr('class');
            if(sel == null){
                sel = dom.prop('tagName');
            }else{
                sel = '.' + sel;
            }
            }else{
                sel = '#' + sel;
            }
            return sel;
        },
        //兄弟要素からタグと一意に特定するselecterを取得
        GetSiblingDef:function(dom,def){
            var resDefinition = def;
            if(!this.tagDecidedFlg){
                //兄弟要素に同じ属性tagがある場合
                if(dom.siblings(resDefinition).length != 0){
                    var tempPreTag = dom.prevAll(resDefinition);
                    if(tempPreTag.length == 0){
                        resDefinition = resDefinition + ':first-of-type';
                    }else{
                        resDefinition = resDefinition + ':nth-of-type('+(tempPreTag.length + 1)+')';
                    }
                }
            }
            return resDefinition;
        },
        //parent selecter定義を追加する
        AddParentDef:function(dom){
            var tempParentDom = dom.parent();
            var tempParentDomDef = this.GetDef(tempParentDom);
            var def = this.GetSiblingDef(tempParentDom,tempParentDomDef);
            this.selecterDefinition = def + ' ' + this.selecterDefinition;
            return tempParentDom;
        },
        //targetTag自体の定義を取得
        GetTargetDef:function(){
            this.selecterDefinition = this.GetDef(this.targetDom);
            if($(this.selecterDefinition).length == 1){
                this.tagDecidedFlg = true; 
                this.selecterType = 'id';
            }
            this.selecterDefinition  = this.GetSiblingDef(this.targetDom,this.selecterDefinition);
        },
        GetDomActionType:function(){
            if(this.targetDom.prop('tagName') == ('select' || 'SELECT')){
                this.domActionType = 'select'; 
            }else if(this.targetDom.prop('tagName') == ('input' || 'INPUT')){
                this.domActionType = 'input'; 
            }else{
                this.domActionType = 'click'; 
            }
        },
        GetValue:function(){
            if(this.domActionType == 'input'){
                this.value = this.targetDom.val();
            }else if(this.domActionType == 'select'){
                //this.value = this.targetDom.val();
            }
        },
        //tagを一意に判別できるselecterを取得する
        GetSelecter:function(){
            this.GetTargetDef();
            this.GetDomActionType();
            var tempDom;
            if(!this.tagDecidedFlg){
            tempDom = this.AddParentDef(this.targetDom);
            this.tagDecidedFlg = ($(this.selecterDefinition).length == 1);
            }
            while(!this.tagDecidedFlg){
            tempDom = this.AddParentDef(tempDom);
            //selecterで一意にdomを指定できるならtrue
            this.tagDecidedFlg = ($(this.selecterDefinition).length == 1);
            if(tempDom == null){//tempDomにundifinedが入った場合対策
                this.tagDecidedFlg = true;
                this.errFlg = true;
            }
            }
            console.log(this.targetDom[0].innerText);
            console.log(this.selecterDefinition);
            console.log($(this.selecterDefinition)[0].innerText);
            return this.selecterDefinition;
        },
        Convert2Json:function(){
            this.JsonStr = '{';
            this.jsonStr += 'TagSelecterTypeId:' + this.TagSelecterTypeId + ','; 
            this.jsonStr += 'TagSelecter:' + this.TagSelecter + ','; 
            this.jsonStr += 'ActionTypeId:' + this.ActionTypeId + ','; 
            this.jsonStr += 'Value:' + this.Value + ','; 
            this.jsonStr += 'EndingSleepTime:' + this.EndingSleepTime; 
            this.JsonStr += '}';
        },
        GetJsonStr:function(){
            this.Convert2Json();
            return this.JsonStr;
        }
    };
    //-------------
    //イベント定義
    //-------------
    $(document).on('click',function(e){
        if(saveFlg){
            var tag = new TagDef($(e.target));
            var targetSelecter = tag.GetSelecter();
            if(tag.errFlg){
                alert('エラーが発生し要素を取得できませんでした。');
            }else{
                tagList.push(tag);
            }
        }
    });
    //------------------------
    //chrome拡張機能イベント定義
    //------------------------
    //chrome.runtime.onMessage.addListener(function(message,sender,sendResponse ) {
    //  if(message.btn == 'save'){
    //    saveFlg = true;
    //  }else if( message.btn == 'stop'){
    //    saveFlg = false;
    //tagList.forEach(function(ele) {
    //    this.GetValue();
    //}, this);
    //var case = new TestCase(tagList);
    //testCaseList.push(case);
    //  }
    //});
    //関数定義
    //---------
    function GetJsonStrList(list){
        var jsonStr = '';
        list.forEach(function(ele){
            jsonStr += ele.GetJsonStr() + ',';
        },this);
        return jsonStr;
    }
    function GetWaitingTime(){
        
    }
    //ajax
    function SaveDefinition(data){

    }
}());

//todo テストケースの定義を変更する。現在遷移単位でテストケースを作成している。
//テストケースの順番を変更する機能がある。直前のテストケースの遷移先ページでテストを行う場合は順番を入れ替えるとテストできなくなるため機能が無意味
//現行のテストケースの一つ上の概念としてテストセットを定義。テストケースの順番入れ替え機能をなくし、テストセット単位での順番入れ替えにする。
// api if
//{   
//    pageTitle:,
//    pageUrl:,
//    TestSetName:,
//    TestSetNo:,
//    TestCaseList:[
    //    TestCaseNo:,
    //    EndingSleepTime:,
    //    DomActList:
    //    [
    //        {
    //            TagSelecterTypeId:,
    //            TagSelecter:,
    //            ActionTypeId:,
    //            Value:,
    //            EndingSleepTime:
    //        },
    //        {
    //            TagSelecterTypeId:,
    //            TagSelecter:,
    //            ActionTypeId:,
    //            Value:,
    //            EndingSleepTime:
    //        }
    //    ]
//    ]
//}
