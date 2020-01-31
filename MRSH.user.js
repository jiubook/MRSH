// ==UserScript==
// @name         McbbsReviewServerHelper
// @namespace    https://space.bilibili.com/1501743
// @version      0.0.4
// @description  MRSH - 你的服务器审核版好助手
// @author       萌萌哒丶九灬书
// @match        *://www.mcbbs.net/thread-*
// @match        *://www.mcbbs.net/forum.php?mod=viewthread*
// @match        *://www.mcbbs.net/forum-serverpending*
// @match        *://www.mcbbs.net/forum.php?mod=forumdisplay&fid=296*
// @create       2020-01-28
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// @downloadURL  https://github.com/jiubook/mcbbsReviewServer/raw/master/MRSH.user.js
// @require      https://cdn.staticfile.org/jquery/1.12.4/jquery.min.js
// @require 	 https://greasyfork.org/scripts/376401-findandreplacedomtext/code/findAndReplaceDOMText.js?version=660038
// @require      https://greasyfork.org/scripts/376402-ddxuf/code/ddxuf.js?version=661422
// ==/UserScript==

(function() {
    'use strict';

    var jq = jQuery.noConflict();
    //jq名称重定义，避免冲突

    //if(!$){
    //    var s = document.createElement ("script");
    //    s.src = "http://cdn.bootcss.com/jquery/1.8.3/jquery.min.js";
    //    s.async = false;
    //    document.documentElement.appendChild (s);
    //}
    //另一种加载jQuery脚本的方法
	
    function TrueOrFalsOrNull(ele,str,info1,info2){
        if(ele > 0){
            str.html(function(i,origText){
                return '✅' + origText;
            });
        }else if(ele < 0) {
            str.html(function(i,origText){
                return '❌' + origText + '❌' + '<font color="red">' + info1 + '</font>';
            });
        }else {
            str.html(function(i,origText){
                return '🔔' + origText + '🔔' + '<font color="orange"><strong>' + info2 + '</strong></font>';
            });
        };
    }

    function TrueOrFalse(ele,str,info){
        if(ele){
            str.html(function(i,origText){
                return '✅' + origText;
            });
        }else {
            str.html(function(i,origText){
                return '❌' + origText + '❌' + '<font color="red">' + info + '</font>';
            });
        };
    }

    var flag_BodyTextSize = true;
    //设置全局变量 BodyTextSize
    function OnlyFalse(ele,str,info){
        if(!ele){
            flag_BodyTextSize = false;
            str.html(function(i,origText){
                return '❌' + '<font color="red">' + info + '</font>' + origText;
            });
        };
    }

    function ReviewTitleZZ(str){
        //正则判断标题
        var ZZ = /^\[(电信|联通|移动|双线|多线|教育|港澳|台湾|欧洲|美洲|亚太|内网)\]([\u4e00-\u9fa5]|\w|\s|[\u0800-\u4e00])*(\s|)——(\s|).[^\[]*\[(\d|\.|X|x|\-)+]$/;
        return ZZ.test(str);
    }
    
    function UserPointZZ(ele){
        //正则判断数值是否为正
        var ZZ = /^[0-9]*\s/;
        return ZZ.test(ele);
    }

    function trim(str){
        //通过正则，清空字符串左右的空白
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }

    function ServerTitleName(str,SvrName){
        var PoZheHao = str.indexOf("—");
        //从左寻找 “—” 的位置
        var YouKuoHao = str.indexOf("]");
        //从左寻找 “]” 的位置
        var subStr = String(str.substring(YouKuoHao + 1,PoZheHao));
        //通过 “]” 和 “—” 定位服务器名称
        subStr = trim(subStr);
        SvrName = trim(SvrName);
        //使用trim函数，清空字符串左右的空白

        //console.log("sbS:" + subStr);
        //console.log("SN:" + SvrName);
        //用于debug输出↑
        if (subStr == SvrName){
            return 3;
        }
        else if (subStr + "服务器" == SvrName){
            return 2;
        }
        else if (subStr == SvrName + "服务器"){
            return 1;
        }
        else{
            return 0;
        };
    }

    function ServerIPAddress(str){
        var SvrIPAddress = trim(str);
        var ZZ3 = /((\w)+\.)+(\w)+(\:[0-9]+)?/;
        //正则匹配带端口或不带端口的域名地址
        var ZZ2 = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/;
        //正则匹配不带端口的IP地址
        var ZZ1 = /([\u4e00-\u9fa5]|\w|\s|[\u0800-\u4e00])+/;
        //正则匹配至少输入了点东西的
        if(ZZ3.test(SvrIPAddress)){
            return 3;
        }else if(ZZ2.test(SvrIPAddress)){
            return 2;
        }else if(ZZ1.test(SvrIPAddress)){
            return 1;
        }else{
            return 0;
        };
    }

    function ServerClientDownloadSet(str){
        var strL = str.indexOf("»");
        //从左寻找 “»” 的位置
        var strR = str.indexOf("下");
        //从左寻找 “下” 的位置
        var subStr = String(str.substring(strL + 1,strR));
        //通过 “»” 和 “下” 定位服务器是否需要下载专用客户端
        subStr = trim(subStr);
        if(subStr == "不需要"){
            return 0;
        } else if(subStr == "需要"){
            return -1;
        };
    }

    function ServerClientDownload(str){
        var SvrCD = trim(str);
        var ZZ1 = /((\w)+\.)+(\w)+(\:[0-9]+)?/;
        var ZZ_1 = /^http(s)?\:\/\/(www.)?([\u4e00-\u9fa5]|\s|[\u0800-\u4e00]|)+(\w)*([0-9]+)*.com$/;
        var ZZ_2 = /jq\.qq\.com/;
        if(ZZ_2.test(SvrCD)){
            return -2;
        }else if(ZZ_1.test(SvrCD)){
            return -1;
        }else if(ZZ1.test(SvrCD)){
            //忽视内容，返回99
            return 99;
        }else {
            return 0;
        };
    }

    function SeverBusinessConditions(str){
        var strR = str.indexOf("服");
        //从左寻找 “服” 的位置
        var subStr = String(str.substring(0,strR));
        //从头开始，通过 “服” 定位服务器是否公益
        if(subStr == "公益"){
            return 0;
        } else if (subStr == "商业"){
            //忽视内容，返回99
            return 99;
        } else{
            return -1;
        };
    }

    function isSeverCommonwealSlogansTrue(str){
        var ZZ1 = /本服是公益服并且愿意承担虚假宣传的一切后果/;
        if(ZZ1.test(str)){
            return 0;
        } else {
            return -1;
        };
    }

    function BodyFontSize(str){
        var cssFontSize = str.css('font-size');
        //找到font-size的css，并提取
        var px = cssFontSize.indexOf('px');
        //找到px字符的位置
        var FontSize=cssFontSize.substring(0,px);
        //将px切割，保留数字字符
        return parseInt(FontSize);
        //将string转换为int型，并返回
    }

    function isNowInServerForum(str){
        var ZZ1 = /服务器/;
        var ZZ2 = /多人联机/
        if(ZZ1.test(str) && ZZ2.test(str)){
            return true;
        } else {
            return false;
        };
    }

    jq(document).ready(function(){
        if (isNowInServerForum(jq(".z").text())) {
        //用于判定是否在服务器版，不在的话就不工作
        jq(function () {
            jq('.s.xst').each(function(){
                TrueOrFalse(ReviewTitleZZ(jq(this).text()), jq(this), '');
            });

            TrueOrFalse(ReviewTitleZZ(jq('#thread_subject').text()), jq('#thread_subject'), '');
            //通过正则表达式判断标题是否正确
            //console.log(jq('#thread_subject').text());
            //用于debug输出标题内容↑

            TrueOrFalse(UserPointZZ(jq(".pil.cl dd").eq(2).text()), jq(".pil.cl dd").eq(2), '');
            //eq(2)为贡献
            //console.log(jq(".pil.cl dd").eq(2).text());
            //用于debug输出贡献点↑

            TrueOrFalse(UserPointZZ(jq(".pil.cl dd").eq(5).text()), jq(".pil.cl dd").eq(5), '');
            //eq(5)为绿宝石
            //console.log(jq(".pil.cl dd").eq(5).text());
            //用于debug输出绿宝石↑

            TrueOrFalse(ServerTitleName(jq('#thread_subject').text(), jq(".cgtl.mbm tbody tr td").eq(0).text()) >= 1 ,jq(".cgtl.mbm tbody tr td").eq(0), '模板服务器名称与标题不符');
            //eq(0)为服务器名称
            //提取标题中的服务器名称后，和模板内服务器名称做对比
            //console.log(jq(".cgtl.mbm tbody tr td").eq(0).text());
            //用于debug输出服务器名称↑
            jq('.t_f font font font').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this), '');
            });
            jq('.t_f font font').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this), '');
            });
            jq('.t_f font').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this), '');
            });
            jq('.t_f div div div div').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this), '');
            });
            jq('.t_f div div div').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this), '');
            });
            jq('.t_f div div').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this), '');
            });
            jq('.t_f div').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this), '');
            });
            jq('.t_f a').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this), '');
            });
            //console.log(flag_BodyTextSize);
            //用于debug输出是否有大于5号的字↑
            if(flag_BodyTextSize == false){
                jq('.t_f').html(function(i,origText){
                    return '<div align="center" class="FontSizeTips"><font color="red" size="4">❌当前页面中含有字符大小超过5的文字</font></div>' + origText;
                });
            }else{
                jq('.t_f').html(function(i,origText){
                    return '<div align="center" class="FontSizeTips"><font color="green" size="4">✅当前页面字符大小合规</font></div>' + origText;
                });
            };
            //用于判断字符是否超过5号（24px）

            //console.log(jq(".cgtl.mbm tbody tr td").eq(14).text());
            //用于debug输出IP地址↑
            TrueOrFalse(ServerIPAddress(jq(".cgtl.mbm tbody tr td").eq(14).text()) >= 1 , jq(".cgtl.mbm tbody tr td").eq(14), '未在模板标注有效的IP地址/获取方式');
            //eq(14)为IP地址
            //使用正则来匹配IP地址

            TrueOrFalsOrNull(ServerClientDownload(jq(".cgtl.mbm tbody tr td").eq(11).text()) + ServerClientDownloadSet(jq(".cgtl.mbm tbody tr td").eq(9).text()), jq(".cgtl.mbm tbody tr td").eq(11), '未在模板标注有效的客户端下载地址', '该服为纯净服，此项选填');
            //eq(9)为服务器类型，eq(11)为客户端下载地址

            TrueOrFalsOrNull(SeverBusinessConditions(jq(".cgtl.mbm tbody tr td").eq(3).text()) + isSeverCommonwealSlogansTrue(jq('.t_f').text()), jq(".cgtl.mbm tbody tr td").eq(3), "公益服标语不合格", "需要注意其公益服标语");
            //eq(3)为服务器营利模式
            
            
            /**
             * ↓↓最后执行↓↓
             */
            start_xx_j();
            //↑百度网盘有效性判断
        
        })
        };
    });

})();