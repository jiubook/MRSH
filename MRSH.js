// ==UserScript==
// @name         McbbsReviewServerHelper
// @namespace    https://space.bilibili.com/1501743
// @version      0.0.2
// @description  MRSH - 你的服务器审核版好助手
// @author       萌萌哒丶九灬书
// @match        *://www.mcbbs.net/thread-*
// @match        *://www.mcbbs.net/forum.php?mod=viewthread*
// @create       2020-01-28
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
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
	
	start_xx_j();
    //↑百度网盘有效性判断

    function TrueOrFalse(ele,str){
        if(ele){
            str.html(function(i,origText){
                return '✅' + origText;
            })
        }else {
            str.html(function(i,origText){
                return '❌' + origText;
            })
        }
    }

    var flag_BodyTextSize = true;
    //设置全局变量 BodyTextSize
    function OnlyFalse(ele,str){
        if(!ele){
            flag_BodyTextSize = false;
            str.html(function(i,origText){
                return '❌' + origText;
            })
        }
    }

    function ReviewTitleZZ(str){
        //正则判断标题
        var ZZ = /^\[(电信|联通|移动|双线|多线|教育|港澳|台湾|欧洲|美洲|亚太|内网)\]([\u4e00-\u9fa5]|\w|\s|[\u0800-\u4e00])*(\s|)——(\s|).[^\[]*\[(\d|\.|X|x|\-)+]$/;
        return ZZ.test(str);
    }
    
    function UserPointZZ(ele){
        //正则判断数值是否为正
        var ZZ = /^[0-9]*\s/
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
        subStr = trim(subStr)
        SvrName = trim(SvrName)
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
        }
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

    jq(document).ready(function(){
        jq(function () {
            TrueOrFalse(ReviewTitleZZ(jq('#thread_subject').text()), jq('#thread_subject'));
            //通过正则表达式判断标题是否正确
            //console.log(jq('#thread_subject').text());
            //用于debug输出标题内容↑

            TrueOrFalse(UserPointZZ(jq(".pil.cl dd").eq(2).text()), jq(".pil.cl dd").eq(2));
            //eq(2)为贡献
            //console.log(jq(".pil.cl dd").eq(2).text());
            //用于debug输出贡献点↑

            TrueOrFalse(UserPointZZ(jq(".pil.cl dd").eq(5).text()), jq(".pil.cl dd").eq(5))
            //eq(5)为绿宝石
            //console.log(jq(".pil.cl dd").eq(5).text());
            //用于debug输出绿宝石↑

            TrueOrFalse(ServerTitleName(jq('#thread_subject').text(), jq(".cgtl.mbm tbody tr td").eq(0).text()) >= 1 ,jq(".cgtl.mbm tbody tr td").eq(0))
            //eq(0)为服务器名称
            //提取标题中的服务器名称后，和模板内服务器名称做对比
            //console.log(jq(".cgtl.mbm tbody tr td").eq(0).text());
            //用于debug输出服务器名称↑

            jq('.t_f font font').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this));
            })
            jq('.t_f font').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this));
            })
            jq('.t_f div div div div').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this));
            })
            jq('.t_f div div div').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this));
            })
            jq('.t_f div div').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this));
            })
            jq('.t_f div').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this));
            })
            jq('.t_f a').each(function(){
                OnlyFalse(BodyFontSize(jq(this)) <= 24, jq(this));
            })
            console.log(flag_BodyTextSize);
            if(flag_BodyTextSize == false){
                jq('.t_f').html(function(i,origText){
                    return '<div align="center"><font color="red" size="4">❌当前页面中含有字符大小超过5的文字</font></div>' + origText;
                });
            }else{
                jq('.t_f').html(function(i,origText){
                    return '<div align="center"><font color="green" size="4">✅当前页面字符大小合规</font></div>' + origText;
                });
            }
            //用于判断字符是否超过5号（24px）


        })
    });
})();