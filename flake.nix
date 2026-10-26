{
  description = "Tasks";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};

      backend = pkgs.rustPlatform.buildRustPackage {
        pname = "tasks-backend";
        version = "0.0.0";
        src = ./backend;
        cargoLock.lockFile = ./backend/Cargo.lock;
        nativeBuildInputs = [ pkgs.pkg-config ];
        buildInputs = [ pkgs.openssl ];
        env.SQLX_OFFLINE = "true";
      };

      frontend = pkgs.stdenv.mkDerivation (finalAttrs: {
        pname = "tasks-frontend";
        version = "0.0.0";
        src = ./frontend;
        pnpmDeps = pkgs.fetchPnpmDeps {
          inherit (finalAttrs) pname version src;
          pnpm = pkgs.pnpm_10;
          fetcherVersion = 3;
          hash = "sha256-dSr5/3xSnww4QXEpj0oTyqEU9lUEV6qaPuIdrCXvojw=";
        };
        nativeBuildInputs = [ pkgs.nodejs pkgs.pnpm_10 pkgs.pnpmConfigHook ];
        buildPhase = ''
          runHook preBuild
          pnpm build
          runHook postBuild
        '';
        installPhase = ''
          runHook preInstall
          cp -r dist $out
          runHook postInstall
        '';
      });
    in {
      packages.${system} = {
        inherit backend frontend;
        default = backend;
      };

      nixosModules.default = { pkgs, ... }@args:
        import ./module.nix {
          tasksBackend = self.packages.${pkgs.stdenv.hostPlatform.system}.backend;
          tasksFrontend = self.packages.${pkgs.stdenv.hostPlatform.system}.frontend;
        } args;
    };
}
