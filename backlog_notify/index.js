'use strict';

const electron = require("electron");
const app = electron.app;
const shell = electron.shell;
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow;
let appIcon;
let force_quit = false;

// Electronの初期化完了後に実行
app.on('ready', function() {
    setApplicationMenu();
    // メイン画面の表示。ウィンドウの幅、高さを指定
    // mainWindow = new BrowserWindow({width: 800, height: 600, show: false});
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    })
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // タスクトレーに入れる
    appIcon = new Tray(__dirname + '/images/icon.png');
    app.dock.hide();
    // クリックされたら表示・非表示切り替え
    appIcon.on('click', function clicked (e, bounds) {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });

    var contextMenu = Menu.buildFromTemplate([
        {label: '表示', click: function() { mainWindow.show(); }},
        {label: '非表示', click: function() { mainWindow.hide(); }},
        {label: '終了', accelerator: 'Command+Q', click: function() { app.quit(); }}
    ]);
    appIcon.setContextMenu(contextMenu);


    // ウィンドウが閉じられたらアプリも終了
    // mainWindow.on('closed', function() {
    //   if (process.platform != 'darwin') {
    //     app.quit();
    //   }
    // });


    // http://qiita.com/yukiB/items/0e2192c26c80bcbdbb90
    // この辺でまぁなんかいい感じに
    mainWindow.on('close', function(e){
        if(!force_quit){
            e.preventDefault();
            mainWindow.hide();
        }
    });

    app.on('before-quit', function (e) {
        force_quit = true;
    });
});

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// 設定読み込み
ipcMain.on('load_conf', (event, arg) => {
    var fs = require('fs');
    var conf = JSON.parse(fs.readFileSync(__dirname + '/conf.json', 'utf8'));
    event.returnValue = conf;
})

// 設定保存
ipcMain.on('save_conf', (event, arg) => {
    var fs = require('fs');
    fs.writeFileSync(__dirname + '/conf.json', arg);
    event.returnValue = arg;
})

function setApplicationMenu (){
    var Menu = require('electron').Menu;
    var menu = Menu.buildFromTemplate([
    {
        label: "Application",
        submenu: [
            {label: "About Application", role: "orderFrontStandardAboutPanel:"},
            {type: "separator"},
            {label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]
    },
    {
        label: "menu",
        submenu: [
            { type: "separator" },
            { label: "Cut", accelerator: "Command+X", role: "cut" },
            { label: "Copy", accelerator: "Command+C", role: "copy" },
            { label: "Paste", accelerator: "Command+V", role: "paste" },
            { label: "Select All", accelerator: "Command+A", role: "selectall" },
            { label: "Close", accelerator: "Command+W", role: "close" }
        ]
    }
    ]);
    Menu.setApplicationMenu(menu);
}


// パッケージング
// electron-packager ./backlog_notify backlog_notify --platform=darwin --arch=x64 --electron-version=1.4.16

// デバッグ用ビルド
// electron backlog_notify/
