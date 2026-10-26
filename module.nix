{ tasksBackend, tasksFrontend }:
{ config, lib, pkgs, ... }:

let
  cfg = config.services.tasks;
  backendUrl = "http://127.0.0.1:${toString cfg.port}";
in {
  options.services.tasks = {
    enable = lib.mkEnableOption "Tasks API, notification worker, and frontend";

    port = lib.mkOption {
      type = lib.types.port;
      default = 8000;
      description = "Local API port.";
    };

    frontendPort = lib.mkOption {
      type = lib.types.port;
      default = 8080;
      description = "Local frontend port.";
    };

    environment = lib.mkOption {
      type = lib.types.attrsOf lib.types.str;
      default = {};
      description = "Environment variables passed to Tasks.";
    };

    environmentFile = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Environment file containing Tasks configuration and secrets.";
    };
  };

  config = lib.mkIf cfg.enable {
    users.groups.tasks = {};
    users.users.tasks = {
      isSystemUser = true;
      group = "tasks";
    };

    systemd.services.tasks = {
      description = "Tasks API and notification worker";
      wantedBy = [ "multi-user.target" ];
      wants = [ "network-online.target" ];
      after = [ "network-online.target" ];
      environment = cfg.environment;
      path = [ pkgs.gettext pkgs.coreutils ];
      preStart = ''
        export PUBLIC_API_URL="$FRONT_URL"
        export PUBLIC_VAPID_PUBLIC_KEY="$VAPID_PUBLIC_KEY"
        envsubst '$PUBLIC_API_URL $PUBLIC_VAPID_PUBLIC_KEY' \
          < ${tasksFrontend}/index.html > /run/tasks/index.html
        chmod 0644 /run/tasks/index.html
      '';
      serviceConfig = {
        ExecStart = "${pkgs.coreutils}/bin/env HOST=127.0.0.1:${toString cfg.port} ${tasksBackend}/bin/backend";
        EnvironmentFile = lib.mkIf (cfg.environmentFile != null) cfg.environmentFile;
        User = "tasks";
        Group = "tasks";
        RuntimeDirectory = "tasks";
        RuntimeDirectoryMode = "0755";
        WorkingDirectory = "/run/tasks";
        Restart = "on-failure";
        RestartSec = 5;
        CapabilityBoundingSet = [ "" ];
        DeviceAllow = [ "" ];
        LimitCORE = 0;
        LockPersonality = true;
        MemoryDenyWriteExecute = true;
        NoNewPrivileges = true;
        PrivateDevices = true;
        PrivateMounts = true;
        PrivateTmp = true;
        PrivateUsers = true;
        ProcSubset = "pid";
        ProtectClock = true;
        ProtectControlGroups = true;
        ProtectHome = true;
        ProtectHostname = true;
        ProtectKernelLogs = true;
        ProtectKernelModules = true;
        ProtectKernelTunables = true;
        ProtectProc = "invisible";
        ProtectSystem = "strict";
        RemoveIPC = true;
        RestrictAddressFamilies = [ "AF_INET" "AF_INET6" "AF_UNIX" ];
        RestrictNamespaces = true;
        RestrictRealtime = true;
        RestrictSUIDSGID = true;
        SystemCallArchitectures = "native";
        SystemCallFilter = [ "@system-service" "~@privileged" "~@resources" ];
        UMask = "0077";
      };
    };

    services.nginx = {
      enable = true;
      virtualHosts.tasks-frontend = {
        listen = [{ addr = "127.0.0.1"; port = cfg.frontendPort; }];
        root = tasksFrontend;
        extraConfig = builtins.readFile ./frontend/security-headers.conf;
        locations = {
          "/".tryFiles = "$uri /index.html";
          "= /index.html".alias = "/run/tasks/index.html";
          "= /api/health" = {
            proxyPass = backendUrl;
            extraConfig = "access_log off;";
          };
          "/api/".proxyPass = backendUrl;
        };
      };
    };
  };
}
