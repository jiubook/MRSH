// ==UserScript==
// @name         McbbsReviewServerHelper
// @namespace    https://space.bilibili.com/1501743
// @version      0.0.14
// @description  MRSH - 你的服务器审核版好助手
// @author       萌萌哒丶九灬书
// @match        *://www.mcbbs.net/thread-*
// @match        *://www.mcbbs.net/forum.php?mod=viewthread*
// @match        *://www.mcbbs.net/forum-serverpending*
// @match        *://www.mcbbs.net/forum.php?mod=forumdisplay&fid=296*
// @match        *://www.mcbbs.net/forum-server*
// @match        *://www.mcbbs.net/forum.php?mod=forumdisplay&fid=179*
// @match        *://www.mcbbs.net/forum-362*
// @match        *://www.mcbbs.net/forum.php?mod=forumdisplay&fid=362*
// @create       2020-01-28
// @lastmodified 2020-02-29
// @note         0.0.14 更新: 1.新增一键通过功能，还在测试稳定性中。
// @note         0.0.13 更新: 1.更改了部分亮色字体颜色的判定; 2.修复了亮色判定的<div>bug. b更新: 1.细小的判定更改.
// @note         0.0.12 更新: 1.精简代码，合并重复内容.
// @note         0.0.11 更新: 1.修复当<font color>中有<u>,<strong>等修饰代码时依旧跳出判定的问题.
// @note         0.0.10 更新: 1.新增近似亮色字体色的判定; 2.*可能*修复了叠加多个<font color>而误判颜色的问题.
// @note         0.0.09 更新: 1.新增查看一服多贴快捷跳转按钮; 2.修复下载地址为mcbbs.net时也判定为正确的错误.
// @note         0.0.08 更新: 1.修复版本号判定时因为选择其他版本而误判错误; 2.修复1.8.x等复合单版本误判问题; 3.修复背景色无法识别的错误.
// @note         1.0.00 版本以前不会去支持一键审核，还需人工查看。
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setValue
// @license      GNU General Public License v3.0
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
    function ThreeDifferentTips(ele,str,info1,info2,info3){
        if(ele > 0){
            str.html(function(i,origText){
                return '🍃' + origText + '🍃' + green(info1);
            });
        }else if(ele < 0) {
            str.html(function(i,origText){
                return '🍁' + origText + '🍁' + red(info2);
            });
        }else {
            str.html(function(i,origText){
                return '🍂' + origText + '🍂' + orange(info3);
            });
        };
    }

    function TrueOrFalsOrNull(ele,str,info2,info3){
        if(ele > 0){
            str.html(function(i,origText){
                return '✅' + origText;
            });
        }else if(ele < 0) {
            str.html(function(i,origText){
                return '❌' + origText + '❌' + red(info2);
            });
        }else {
            str.html(function(i,origText){
                return '🔔' + origText + '🔔' + orange(info3);
            });
        };
    }

    function TrueOrFalse(ele,str,info2){
        if(ele){
            str.html(function(i,origText){
                return '✅' + origText;
            });
        }else {
            str.html(function(i,origText){
                return '❌' + origText + '❌' + red(info2);
            });
        };
    }

    function OnlyFalse(ele,str,info2){
        if(!ele){
            str.html(function(i,origText){
                return '❌' + red(info2) + origText;
            });
        };
    }

    function green(str){
        if(str != ''){
            return '<font color="green">' + str + '</font>';
        }else{
            return '';
        }
    }

    function red(str){
        if(str != ''){
            return '<font color="red">' + str + '</font>';
        }else{
            return '';
        }
    }

    function orange(str){
        if(str != ''){
            return '<font color="#A63C00">' + str + '</font>';
        }else{
            return '';
        }
    }

    var flag_ReviewTitleZZ = true;
    function ReviewTitleZZ(str){
        //正则判断标题
        //var ZZ = /^\[(电信|联通|移动|双线|多线|教育|港澳|台湾|欧洲|美洲|亚太|内网)\]([\u4e00-\u9fa5]|\w|\s|[\u0800-\u4e00])*(\s|)——(\s|).[^\[]*\[(\d|\.|X|x|\-)+]$/;
        var ZZ = /^\[(电信|联通|移动|双线|多线|教育|港澳|台湾|欧洲|美洲|亚太|内网)\]([0-9a-zA-Z\u2160-\u217f\u3040-\u30ff\u31f0-\u31ff\u4e00-\u9fa5]|\s)+——([^\u2014]|\s)+\[(\-?1\.\d{1,2}(\.(\d{1,2}|X|x))?){1,2}\]$/;
        if (ZZ.test(str)){
            return true;
        }else{
            flag_ReviewTitleZZ = false;
            return false;
        }
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

    var VersionList = ['1.15.2', '1.15.1', '1.15',
                       '1.14.4', '1.14',
                       '1.13.2', '1.13.1', '1.13',
                       '1.12.2', '1.12.1', '1.12',
                       '1.11.2', '1.11',
                       '1.10.X',
                       '1.9.4', '1.9',
                       '1.8.X',
                       '1.7.10', '1.7.2',
                       '1.6.4'];
    var VersionList_X = ['1.6.X', '1.7.X', '1.8.X', '1.9.X', '1.10.X', '1.11.X', '1.12.X', '1.13.X', '1.14.X', '1.15.X'];
    var VersionList_x = ['1.6.x', '1.7.x', '1.8.x', '1.9.x', '1.10.x', '1.11.x', '1.12.x', '1.13.x', '1.14.x', '1.15.x'];
    function ServerVersionXS(str){
        for(var i = 0; i < VersionList_X.length; i++){
            if((str == VersionList_X[i])||(str == VersionList_x[i])){
                break;
            };
        };
        switch(i){
            case 9:
                return VersionList[VersionList.length - 20];
            case 8:
                return VersionList[VersionList.length - 17];
            case 7:
                return VersionList[VersionList.length - 15];
            case 6:
                return VersionList[VersionList.length - 12];
            case 5:
                return VersionList[VersionList.length - 9];
            case 4:
                return VersionList[VersionList.length - 7];
            case 3:
                return VersionList[VersionList.length - 6];
            case 2:
                return VersionList[VersionList.length - 4];
            case 1:
                return VersionList[VersionList.length - 3];
            case 0:
                return VersionList[VersionList.length - 1];
            default:
                return str;
        };
    }
    function ServerVersionXE(str){
        for(var i = 0; i < VersionList_X.length; i++){
            if((str == VersionList_X[i])||(str == VersionList_x[i])){
                break;
            };
        };
        switch(i){
            case 9:
                return VersionList[VersionList.length - 18];
            case 8:
                return VersionList[VersionList.length - 16];
            case 7:
                return VersionList[VersionList.length - 13];
            case 6:
                return VersionList[VersionList.length - 10];
            case 5:
                return VersionList[VersionList.length - 8];
            case 4:
                return VersionList[VersionList.length - 7];
            case 3:
                return VersionList[VersionList.length - 5];
            case 2:
                return VersionList[VersionList.length - 4];
            case 1:
                return VersionList[VersionList.length - 2];
            case 0:
                return VersionList[VersionList.length - 1];
            default:
                return str;
        };
    }
    function getServerVersion(str1, str2){
        var strL = str1.lastIndexOf("[");
        var strR = str1.lastIndexOf("]");
        var subStr = String(str1.substring(strL + 1,strR));
        subStr = trim(subStr);
        var ServerVersion = trim(str2)
        ServerVersion = ServerVersion.split(/\s+/);
        //ServerVersion为模板选择的版本号
        var ZZ4 = /^\d{2}w\d{2}[a-z]$/;
        //20w05a
        var ZZ3 = /^1\.\d{1,2}(\.(\d{1,2}|X|x))?\-1\.\d{1,2}(\.(\d{1,2}|X|x))?$/;
        //1.7.2-1.12.2
        var ZZ2 = /^1\.\d{1,2}(\.\d{1,2})?$/;
        //1.7.10
        var ZZ1 = /^1\.\d{1,2}\.(X|x)$/;
        //1.7.x
    /*
        console.log("sbS:" + subStr);
        console.log("SvS:" + ServerVersion[0] + "; SvE:" + ServerVersion[ServerVersion.length - 1]);
        console.log("SvL:" + ServerVersion.length);
        console.log("VlS:" + VersionList[0] + "; VlE:" + VersionList[VersionList.length - 1]);
        console.log("VlL:" + VersionList.length);
        console.log(ZZ4.test(subStr));
        console.log(ZZ3.test(subStr));
        console.log(ZZ2.test(subStr));
        console.log(ZZ1.test(subStr));
        ↑调试用
    */
        if(ZZ4.test(subStr) && ServerVersion[ServerVersion.length - 1] == '其它版本'){
        //其他版本的情况
            return 4;
        }else if(ZZ3.test(subStr)){
        //多版本的情况
            var TitleVersion3 = subStr.split('-');
            //TitleVersion为标题版本号
            trim(TitleVersion3[0]);
            trim(TitleVersion3[1]);
            //避免有人在-的左右加空格
            if(ServerVersionXS(TitleVersion3[1]) == ServerVersion[0] && (ServerVersionXE(TitleVersion3[0]) == ServerVersion[ServerVersion.length - 1] || (ServerVersion[ServerVersion.length - 1] == '其它版本' && ServerVersionXE(TitleVersion3[0]) == ServerVersion[ServerVersion.length - 2]))){
            //先判定标题中的版本号是否和模板相符合
                for(var i_3 = 0; i_3 < VersionList.length; i_3++){
                //遍历VersionList，直到找到ServerVersion
                    if(ServerVersion[0] == VersionList[i_3]){
                        break;
                    };
                };
                if(ServerVersion[ServerVersion.length - 1] == VersionList[i_3 + ServerVersion.length - 1]){
                    return 3;
                }else{
                //缺项漏项 return -2
                    return -2;
                };
            }else{
            //标题中的版本号和模板不符 就直接return -3
                return -3;
            };
        }else if(ZZ2.test(subStr)){
        //单版本的情况
            var TitleVersion2 = trim(subStr);
            if (TitleVersion2 == ServerVersion[0]){
            //判定标题中的版本号是否和模板相符合
                return 2;
            }else{
            //标题中的版本号和模板不符 就直接return -3
                return -3;
            };
        }else if(ZZ1.test(subStr)){
        //单版本、复合版本的情况
            var TitleVersion1 = trim(subStr);
            if(ServerVersionXS(TitleVersion1) == ServerVersion[0] && ServerVersionXE(TitleVersion1) == ServerVersion[ServerVersion.length - 1]){
            //先判定标题中的版本号是否和模板相符合
                for(var i_1 = 0; i_1 < VersionList.length; i_1++){
                //遍历VersionList，直到找到ServerVersion
                    if(ServerVersion[0] == VersionList[i_1]){
                        break;
                    };
                };
                if(ServerVersion[ServerVersion.length - 1] == VersionList[i_1 + ServerVersion.length - 1]){
                    return 1;
                }else{
                //缺项漏项 return -2
                    return -2;
                };
            }else{
            //标题中的版本号和模板不符 就直接return -3
                return -3;
            };
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

    function ServerType(str){
        var strR = str.indexOf("»");
        //从左寻找 “»” 的位置
        var subStr = String(str.substring(0,strR));
        //从开头到 “»” 定位服务器类型
        subStr = trim(subStr);
        //console.log(subStr);
        if(subStr == "纯净服务器"){
            return 1;
        } else if(subStr == "Mod服务器"){
            return -1;
        } else if(subStr == "其他（下面注明）"){
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
        //忽视内容，返回99
            return 99;
        } else if(subStr == "需要"){
            return -1;
        } else if(subStr == ""){
            return 0;
        };
    }

    function ServerClientDownload(str){
        var SvrCD = trim(str);
        var ZZ1 = /((\w)+\.)+(\w)+(\:[0-9]+)?/;
        var ZZ_1 = /^http(s)?\:\/\/(www.)?([\u4e00-\u9fa5]|\s|[\u0800-\u4e00]|)+(\w)*([0-9]+)*.com$/;
        var ZZ_2 = /jq\.qq\.com/;
        var ZZ_3 = /(群|君羊|裙)+/;
        var ZZ_4 = /mcbbs\.net/
        if(ZZ_4.test(SvrCD)){
            return -4;
        }else if(ZZ_3.test(SvrCD)){
            return -3;
        }else if(ZZ_2.test(SvrCD)){
            return -2;
        }else if(ZZ_1.test(SvrCD)){
            return -1;
        }else if(ZZ1.test(SvrCD)){
            return 1;
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

    function isAllEqual(array){
    //输入一个值，或是一个数组，判定其是否所有数值都相等;
        return array.every(function(value,i){
            return value == 1;
        });
    }

    function JudgeSameColor(str1,str2){
        //输入color1和color2，判定两个值是否在某个误差内
        var Dvalue = 15;
        var check = [];
        var str1L = str1.indexOf("(");
        var str1R = str1.indexOf(")");
        var subStr1 = String(str1.substring(str1L + 1,str1R));
        var Color1 = subStr1.split(', ');

        var str2L = str2.indexOf("(");
        var str2R = str2.indexOf(")");
        var subStr2 = String(str2.substring(str2L + 1,str2R));
        var Color2 = subStr2.split(', ');

        for(var i_1 = 0; i_1 < Color1.length; i_1++){
            if(Math.abs(Color1[i_1] - Color2[i_1]) <= Dvalue){
                check[i_1] = 1;
            }else{
                check[i_1] = 0;
            };
        };
        return isAllEqual(check);
    }

    var flag_BodyTextSize = true;
    var flag_BodyTextColor = true;
    var flag_BodyTextBGColor = true;
    var flag_BodyTextGGL = true;
    //设置全局变量 字体大小, 字体颜色, 背景颜色, 刮刮乐
    function BodyFont_Size_Color(str){
        var str_ZZ1 = /font\scolor/;
        var str_ZZ2 = /<br>/;
        var str_ZZ3 = /^\s\s+$/;
        if(trim(str.text()) == '' || trim(str.find("*").children().text()) != '' ){
        //如果内容为空，或依旧有内容时，直接返回true，即跳出判断;
        /*  console.log('flag_text: ' + str.text());
            console.log('flag_HTML: ' + str.html());
            调试用 ↑*/
            if (str_ZZ1.test(str.html()) || (str_ZZ2.test(str.html()) && trim(str.find("*").children().text()) == '')){
            //如果内容中还包含‘font color’，或是只有‘<br>’且无其他内容时，才跳出判断。
                return true;
            }
        }
        
        var color = ['rgb(0, 255, 255)','rgb(255, 255, 0)','rgb(0, 255, 0)','rgb(255, 0, 255)']
        var color_RGBA = ['rgba(0, 255, 255, 0)','rgba(255, 255, 0, 0)','rgba(0, 255, 0, 0)','rgba(255, 0, 255, 0)']
        //按顺序，分别为亮青色, 亮黄色, 亮绿色, 亮粉色
        var flag_FontSize = true;
        var cssFontSize = str.css('font-size');
        //找到font-size的css，并提取
        var px = cssFontSize.indexOf('px');
        //找到px字符的位置
        var FontSize=cssFontSize.substring(0,px);
        //将px切割，保留数字字符
        if(parseInt(FontSize) > 24){
        //将string转换为int型，并判断
            flag_BodyTextSize = false;
            flag_FontSize = false;
        }
        var flag_FontColor = true;
        var cssFontColor = str.css('color');
        //var cssFontColor = str.getElementById('color').style.color;
        //找到color的css，并提取
        for (var i_color = 0; i_color < 4; i_color++){
            if((JudgeSameColor(cssFontColor, color[i_color]) || JudgeSameColor(cssFontColor, color_RGBA[i_color])) && cssFontColor !='' && !str_ZZ3.test(str.text())){
                //判定RGB | RGBA | 是否为空 | 内容是否为多个空格
                console.log('text: ' + str.text());
                console.log('color: ' + cssFontColor);
                console.log('color['+ i_color +']: ' + color[i_color] + 'RGBA['+ i_color +']: ' + color_RGBA[i_color]);
            /*  调试用 暂时不删 ↑*/
                flag_BodyTextColor = false;
                flag_FontColor = false;
                break;
            }
        }
        var flag_FontBGColor = true;
        var cssFontBGColor = str.css("background-color");
        //var cssFontBGColor = str.getElementById('color').style.backgroundColor;
        //找到color的css，并提取
        for (var i_BGColor = 0; i_BGColor < 4; i_BGColor++){
            if((JudgeSameColor(cssFontBGColor, color[i_BGColor]) || JudgeSameColor(cssFontBGColor, color_RGBA[i_BGColor])) && cssFontBGColor !=''){
                console.log('text: ' + str.text());
                console.log('BGcolor: ' + cssFontBGColor);
                console.log('BGcolor['+ i_BGColor +']: ' + color[i_BGColor] + 'RGBA['+ i_BGColor +']: ' + color_RGBA[i_BGColor]);
            /*  调试用 暂时不删 ↑*/
                flag_BodyTextBGColor = false;
                flag_FontBGColor = false;
                break;
            }
        }
        var flag_FontGGL = true;
        if (JudgeSameColor(cssFontBGColor, cssFontColor) && (cssFontBGColor != '' || cssFontColor != '')){
            flag_BodyTextGGL = false;
            flag_FontGGL = false;
        }

        return flag_FontSize && flag_FontColor && flag_FontBGColor && flag_FontGGL;
    }

    function BodyFontFlag(){
    //用于输出是否违规的tips
        var TipText = '';
        if(flag_BodyTextSize == false){
            TipText = TipText + red('❌字号大于5');
        }else{
            TipText = TipText + green('✅字号合规');
        };
        if(flag_BodyTextColor == false){
            TipText = TipText + '|' + red('❌亮色字体');
        }else{
            TipText = TipText + '|' + green('✅亮色字体');
        };
        if(flag_BodyTextBGColor == false){
            TipText = TipText + '|' + red('❌亮色背景');
        }else{
            TipText = TipText + '|' + green('✅亮色背景');
        };
        if(flag_BodyTextGGL == false){
            TipText = TipText + '|' + red('❌妨碍阅读的字体/背景');
        }else{
            TipText = TipText + '|' + green('✅其他颜色违规');
        };
        jq('.t_f').html(function(i,origText){
            return '<div align="center" class="FontSizeTipsDiv"><font size="4" class="FontSizeTips">' + TipText + '</font></div>' + origText;
        });
    }

    function CheckMultipleThread(){
    //一服多贴tips
        var UserHomeHref = jq('.avtm').attr("href");
        var ServerThreadHref = '&do=thread&from=space&fid=179';
        var TipText = '<a href="' + UserHomeHref + ServerThreadHref + '" class="CheckMultipleThread">' + orange('🔔检查一服多贴') + '</a>|'
        jq('.FontSizeTips').html(function(i,origText){
            return TipText + origText;
        });
    }

    function BtnPass(){
    //一键通过btn
        var BtnPassText = '<button class="BtnPass">'+ green('通过') +'</button>|'
        jq('.FontSizeTips').html(function(i,origText){
            return BtnPassText + origText;
        });
    }

    function isNowInServerForum(str){
        var ZZ1 = /服务器/;
        var ZZ2 = /gid=167/;
        //多人联机大区分区的固定URL
        if(ZZ1.test(str) && ZZ2.test(str)){
            return true;
        } else {
            return false;
        };
    }

    function isNull(str){
        str = trim(str);
        if(str == '' || str == '-' || str == '\\' || str == '/'){
            return 0;
        } else{
            return 1;
        }
    }
    
    var ServerTypeslist = ["公告", "生存", "创造", "混合（下面注明）", "战争", "RPG", "小游戏"]
    function ServerMoveType(str){
        for(var i = 0; i < ServerTypeslist.length; i++){
            if(str == ServerTypeslist[i]){
                console.log(i);
                return i;
            };
        };
    }

    function OneKeyPass(){
        modthreads(2, 'move')
            //移动
        setTimeout(function (){
            jq("#moveto").trigger("change");
            setTimeout(function (){jq('#moveto optgroup:eq(5) option:eq(1)').prop("selected", true)}, 250);
            //选择服务器版
            setTimeout(function (){jq("#moveto").trigger("change")}, 500);
            //setTimeout(function (){jq('#threadtypes option:eq('+ ServerMoveType(jq('.cgtl.mbm tbody tr td').eq(4).text()) + ')').attr("selected", true)}, 500);
            setTimeout(function (){jq('#threadtypes option:eq('+ ServerMoveType(jq('.cgtl.mbm tbody tr td').eq(4).text()) + ')').prop("selected", true)}, 750);
            //选择生存
            setTimeout(function (){jq("textarea#reason").val('通过')}, 750);
            //填充文本“通过”
            setTimeout(function (){jq("button#modsubmit").click()}, 1000)
            //延迟1秒点击确认
        }, 1000)
    }

    jq(document).ready(function(){
        if (isNowInServerForum(jq(".bm.cl").html())) {
        //用于判定是否在服务器版，不在的话就不工作
        jq(function () {
            jq('.s.xst').each(function(){
            //用于判定页面所有服务器帖的标题
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

            TrueOrFalse(ServerTitleName(jq('#thread_subject').text(), jq(".cgtl.mbm tbody tr td").eq(0).text()) > 0 , jq(".cgtl.mbm tbody tr td").eq(0), '模板服务器名称与标题不符');
            //eq(0)为服务器名称
            //提取标题中的服务器名称后，和模板内服务器名称做对比
            //console.log(jq(".cgtl.mbm tbody tr td").eq(0).text());
            //用于debug输出服务器名称↑

            TrueOrFalse(getServerVersion(jq('#thread_subject').text(), jq(".cgtl.mbm tbody tr td").eq(2).text()) > 0, jq(".cgtl.mbm tbody tr td").eq(2), '模板版本号与标题不符');
            //eq2为版本号
            //提取标题中的版本号后，和模板内版本号做对比

            jq('.t_f').find('font').each(function(){
                OnlyFalse(BodyFont_Size_Color(jq(this)), jq(this), '');
            });
            //console.log(flag_BodyTextSize);
            //用于debug输出是否有大于5号的字↑

            jq('.spoilerbody').each(function(){
                jq(this).css('display','block');
            })
            //展开所有的折叠页

            BodyFontFlag();
            //输出是否违规的tips
            CheckMultipleThread();
            //输出检查一服多贴的tips

            //console.log(jq(".cgtl.mbm tbody tr td").eq(14).text());
            //用于debug输出IP地址↑
            TrueOrFalse(ServerIPAddress(jq(".cgtl.mbm tbody tr td").eq(14).text()) >= 1 , jq(".cgtl.mbm tbody tr td").eq(14), '未在模板标注有效的IP地址/获取方式');
            //eq(14)为IP地址
            //使用正则来匹配IP地址

            TrueOrFalsOrNull(ServerClientDownload(jq(".cgtl.mbm tbody tr td").eq(11).text()) + ServerClientDownloadSet(jq(".cgtl.mbm tbody tr td").eq(9).text()), jq(".cgtl.mbm tbody tr td").eq(11), '未在模板标注有效的客户端下载地址', '记得测试一下是否有效');
            //eq(9)为服务器类型，eq(11)为客户端下载地址

            ThreeDifferentTips(ServerType(jq(".cgtl.mbm tbody tr td").eq(9).text()), jq(".cgtl.mbm tbody tr td").eq(9), '该服为“纯净”类型，注意Mod/插件', '', '只允许领域服选择“其他”类型');
            //eq(9)为服务器类型

            TrueOrFalsOrNull(SeverBusinessConditions(jq(".cgtl.mbm tbody tr td").eq(3).text()) + isSeverCommonwealSlogansTrue(jq('.t_f').text()), jq(".cgtl.mbm tbody tr td").eq(3), "公益服标语不合格", "需要注意其公益服标语");
            //eq(3)为服务器营利模式

            BtnPass();
            //创建通过按钮

            jq(".BtnPass").click(function() {
                OneKeyPass();
            })
            //modthreads(4)
            //关闭

            /**
             * ↓↓最后执行↓↓
             */
            jq(".cgtl.mbm tbody tr td").each( function(){
                //用于判定模板是否有空
                    OnlyFalse(isNull(jq(this).text()), jq(this), '该项为空');
                });

            start_xx_j();
            //↑百度网盘有效性判断

        })
        };
    });

})();