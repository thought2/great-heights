{

sources ? import ./nix/sources.nix,

pkgs ? import sources.nixpkgs { },

yarn ? pkgs.yarn,

yarn2nix ? import sources.yarn2nix { },

}:
let
  yarnPackage = yarn2nix.mkYarnPackage {

    src = pkgs.runCommand "src" { } ''
      mkdir $out
      ln -s ${./package.json} $out/package.json
      ln -s ${./yarn.lock} $out/yarn.lock
    '';

    publishBinsFor = [ "parcel" "typescript" ];

  };

  yarnModules = yarn2nix.mkYarnModules {
    name = "great-heights";
    pname = "great-heights";
    version = "v0.0.1";
    packageJSON = ./package.json;
    yarnLock = ./yarn.lock;
  };

in pkgs.stdenv.mkDerivation {

  name = "great-heights";

  buildInputs = [ yarn yarnPackage ];

  phases = [ "buildPhase" "installPhase" ];

  src = pkgs.runCommand "src" { } ''
    mkdir $out

    pushd $out
      ln -s ${./Makefile} ./Makefile
      ln -s ${yarnModules}/node_modules ./node_modules
      ln -s ${./tsconfig.json} ./tsconfig.json
      ln -s ${./package.json} ./package.json
      ln -s ${./src} ./src
    popd
  '';

  buildPhase = ''
    tmp=`mktemp -d`

    cp -r $src/* -t $tmp

    pushd $tmp
      make
    popd
  '';

  installPhase = ''
    cp -r $tmp/dist $out
  '';

}
