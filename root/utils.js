export const getBasePath = (path) => {
    return path.substring(0, path.lastIndexOf("/"))
}